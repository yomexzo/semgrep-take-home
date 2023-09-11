import { exec } from 'child_process';
import fs from 'fs';

export default (url, path, directory_path, name, full_name) => {
  return new Promise((resolve, reject) => {
    // console.log(`Scanning ${url}`);

    const semgrep_output_path = `${path}/semgrep_output.json`;
    exec(`semgrep --config "p/r2c-security-audit" ${path} --json > ${path}/semgrep_output.json`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error encountered scanning ${path}`);
        console.error(`\n${error}`);
        reject(error); 

        return;
      }

      const semgrep_output = JSON.parse(fs.readFileSync(semgrep_output_path, 'utf8'));

      resolve({
        url,
        path,
        directory_path,
        name,
        full_name,
        semgrep_output_path,
        semgrep_output,
      });
    });
  });
}