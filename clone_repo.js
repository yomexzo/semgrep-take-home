import fs from 'fs';
import { exec } from 'child_process';

export default (url, directory_path, name, full_name) => {
  return new Promise((resolve, reject) => {
    // console.log(`Cloning ${url}`);

    const path = `${directory_path}/${full_name}`;

    if (fs.existsSync(path)) {
      fs.rmSync(path, { recursive: true });
    }

    exec(`git clone --depth 1 ${url} ${path}`, (error, stdout, stderr) => {
      if (error) {
        console.warn(`${url} ${error}`);
        reject(error);
        return;
      }
      resolve({
        url,
        name,
        full_name,
        directory_path,
        path,
      });
    });
  });
}