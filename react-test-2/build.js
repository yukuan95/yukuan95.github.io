import { fileURLToPath } from 'url';
import { join } from 'path';
import fs from 'fs-extra';

const main = async () => {
  let url = import.meta.url;
  let __filename = fileURLToPath(url);
  let src = join(__filename, '../dist');
  let dest = join(__filename, '../../');
  let res = (await fs.readdir(src)).filter((item) => item !== '.DS_Store');
  for (let item of res) {
    let k = join(src, item)
    let v = join(dest, item)
    if (await fs.pathExists(v)) {
      await fs.remove(v);
    }
    await fs.copy(k, v);
  }
  await fs.remove(src);
};

main();
