import subprocess


if __name__ == "__main__":
    subprocess.run(["python", "-m", "app.ml.train"], check=True, cwd="backend")
