import readline from 'readline';

export default (prompt = '') => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
  
    return new Promise((resolve) => {
      rl.question(prompt, (answer) => {
        rl.close();
        resolve(answer);
      });
    });
  }