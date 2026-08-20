#!/usr/bin/env python3
"""
NIMBUS backend deployment helper.

Zips each Lambda handler in backend/ and pushes it to AWS via
`aws lambda update-function-code`. This keeps the deployed
functions in sync with the source of truth committed to the repo.

Usage (from the repo root):

    python backend/scripts/deploy.py                    # deploy all
    python backend/scripts/deploy.py chat admin          # deploy a subset
    python backend/scripts/deploy.py --help

Prerequisites
-------------
- AWS CLI installed and configured with a profile that can
  update Lambda functions (see README.md).
- A default profile or --profile <name>.

This script is idempotent: re-running it only re-uploads the code,
it does not rebuild infrastructure.
"""
import argparse
import json
import os
import shutil
import subprocess
import sys
import tempfile
import zipfile

# Maps logical name -> (folder under backend/, deployed Lambda name).
FUNCTIONS = {
    "chat": ("chat", "nimbus-chat-handler"),
    "admin": ("admin", "nimbus-admin-handler"),
    "documents": ("documents", "nimbus-documents-handler"),
}

REPO_ROOT = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..")
)

BACKEND_DIR = os.path.join(REPO_ROOT, "backend")


def run_aws(args, profile, region):
    command = ["aws"]
    if profile:
        command += ["--profile", profile]
    if region:
        command += ["--region", region]
    command += args

    result = subprocess.run(
        command,
        capture_output=True,
        text=True,
    )
    return result


def make_zip(source_dir, zip_path):
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as archive:
        for root, _, files in os.walk(source_dir):
            for filename in files:
                if filename.endswith(".py"):
                    full = os.path.join(root, filename)
                    archive.write(
                        full,
                        arcname=filename,
                    )


def deploy_one(logical, profile, region, dry_run):
    folder, function_name = FUNCTIONS[logical]
    source_dir = os.path.join(BACKEND_DIR, folder)
    source_file = os.path.join(source_dir, "lambda_function.py")

    if not os.path.exists(source_file):
        print(f"[skip] {logical}: {source_file} not found")
        return False

    # Compile check before packaging.
    py_compile = subprocess.run(
        [sys.executable, "-m", "py_compile", source_file],
        capture_output=True,
        text=True,
    )
    if py_compile.returncode != 0:
        print(f"[fail] {logical}: syntax error\n{py_compile.stderr}")
        return False

    if dry_run:
        print(f"[dry-run] {logical}: would zip {source_dir} -> {function_name}")
        return True

    with tempfile.TemporaryDirectory() as tmp:
        zip_path = os.path.join(tmp, f"{function_name}.zip")
        make_zip(source_dir, zip_path)

        print(f"[deploy] {logical} -> {function_name} ...")
        result = run_aws(
            [
                "lambda",
                "update-function-code",
                "--function-name",
                function_name,
                "--zip-file",
                f"fileb://{zip_path}",
                "--query",
                "{State:State,LastModified:LastModified,CodeSize:CodeSize}",
                "--output",
                "json",
            ],
            profile,
            region,
        )

        if result.returncode != 0:
            print(f"[fail] {logical}:\n{result.stderr}")
            return False

        info = json.loads(result.stdout or "{}")
        print(
            f"[ok] {logical}: state={info.get('State')} "
            f"size={info.get('CodeSize')}"
        )
        return True


def main():
    parser = argparse.ArgumentParser(
        description="Deploy NIMBUS backend Lambda functions."
    )
    parser.add_argument(
        "targets",
        nargs="*",
        help="Functions to deploy: chat, admin, documents (default: all)",
    )
    parser.add_argument(
        "--profile",
        default=os.environ.get("AWS_PROFILE", ""),
        help="AWS CLI profile to use",
    )
    parser.add_argument(
        "--region",
        default="us-east-1",
        help="AWS region (default: us-east-1)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Validate without uploading",
    )
    args = parser.parse_args()

    targets = args.targets or list(FUNCTIONS.keys())

    unknown = [t for t in targets if t not in FUNCTIONS]
    if unknown:
        print(f"Unknown function(s): {', '.join(unknown)}")
        print(f"Valid: {', '.join(FUNCTIONS.keys())}")
        sys.exit(2)

    ok = True
    for target in targets:
        deployed = deploy_one(
            target,
            args.profile,
            args.region,
            args.dry_run,
        )
        ok = ok and deployed

    if not ok:
        sys.exit(1)

    print("\nDone.")


if __name__ == "__main__":
    main()
