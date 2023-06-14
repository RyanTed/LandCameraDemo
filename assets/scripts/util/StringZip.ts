/*
 * @Author: RyanJiang
 * @Date: 2021-07-26 11:10:19
 * @LastEditTime: 2023-06-14 09:40:37
 * @LastEditors: RyanJiang
 * @Description: 字符串压缩解压缩，使用gzip+base64
 * @FilePath: /LandCameraDemo/assets/scripts/util/StringZip.ts
 */

import * as pako from 'pako';

export function unzip(b64Data: string) {
    let binaryString = Buffer.from(b64Data, 'base64');
    let strData = pako.ungzip(binaryString, { to: 'string' });
    return strData;
}

// 压缩
export function zip(str: string) {
    const binaryString = pako.gzip(str);
    let strData = Buffer.from(binaryString).toString('base64');
    return strData;
}

// export function testZip(data: Object, name: string) {
//     const srcString = JSON.stringify(data);
//     let zipedString = zip(srcString);
//     console.log(
//         `=======zipped ${name}==========`,
//         srcString.length,
//         zipedString.length
//     );
//     console.log(zipedString);
//     console.log('++++++++++++');
//     let unzippeddString = unzip(zipedString);
//     console.log(unzippeddString);
// }
