

const fs = require('fs/promises');
const path = require('path');
import store from '../store';
// import store from '../store/index';
// 查询指定文件夹下的所有文件夹
async function getFolderPathList(folderPath) {
  try {
    const files = await fs.readdir(folderPath);

    const folderPromises = files.map(async file => {
      const fullPath = path.join(folderPath, file);
      try {
        const stats = await fs.stat(fullPath);
        return stats.isDirectory() ? fullPath : null;
      } catch (err) {
        console.error(`Error getting stats for ${fullPath}:`, err);
        return null;
      }
    });

    const folders = (await Promise.all(folderPromises)).filter(Boolean);
    return folders;
  } catch (err) {
    console.error("Error reading directory:", err);
    throw err;
  }
}

// 检验config.json文件是否存在，不存在则创建一个默认配置文件
async function existsSyncConfig(folderPath, name) {
  const configFilePath = path.join(folderPath, `${name}.json`)
  try {
    await fs.access(configFilePath, 4)
    console.log(`${name}.json 文件存在！`)
    // readConfigJson(configFilePath)
    saveReadConfigJson(configFilePath)
  } catch (err) {
    console.log(err)
    console.log(`${name}.json 文件不存在！`)
    const config = {
      projectList: [
      ]
    }
    fs.writeFile(`${name}.json`, JSON.stringify(config)).then((err) => {
      if (err) {
        console.log(err)
        return alert(`创建 ${name}.json 文件失败: ${JSON.stringify(err)}`);
      }
      console.log('完成')
    })

  }
}

// 读取配置文件内容
function readConfigJson(configFilePath) {
  return new Promise((resolve, reject) => {
    console.log('读取配置文件')
    fs.readFile(configFilePath, 'utf8').then((ret, err) => {
      if (err) {
        return alert(`读取配置文件失败:${JSON.stringify(err)}`)
      }
      const configData = JSON.parse(ret)
      console.log(configData)
      resolve(configData)
    })
  })
}

// vuex 保存读取赋值配置文件
function saveReadConfigJson(configFilePath) {
  console.log('读取配置文件')
  fs.readFile(configFilePath, 'utf8').then((ret, err) => {
    if (err) {
      return alert(`读取配置文件失败:${JSON.stringify(err)}`)
    }
    const configData = JSON.parse(ret)
    store.commit('projectList', configData.projectList)
    console.log(configData)
  })
}
// 写入配置文件
function writeConfigJson(data, name) {
  return new Promise((resolve, reject) => {
    fs.writeFile(`${name}.json`, JSON.stringify(data)).then((err) => {
      if (err) {
        console.log(err)
        resolve(false, err)
        return alert(`创建 ${name}.json 文件失败: ${JSON.stringify(err)}`);
      }
      resolve(true)
      console.log('完成')
      saveReadConfigJson(`${name}.json`)
    })
  })
}

export {
  getFolderPathList,
  existsSyncConfig,
  readConfigJson,
  saveReadConfigJson,
  writeConfigJson
}