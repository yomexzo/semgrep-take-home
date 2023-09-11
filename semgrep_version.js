import { exec } from 'child_process';

export default () => {
  return new Promise((resolve, reject) => {
    exec(`semgrep --version`, (error, stdout, stderr) => {
      if (error) {
        console.error(`It appears semgrep is not installed on your machine. Follow instructions at https://semgrep.dev/docs/getting-started/ to install semgrep`);
        console.error(`\n${error}`);
        resolve(false);
        process.exit(1);
  
      }
      resolve(true);
    });
  });
}