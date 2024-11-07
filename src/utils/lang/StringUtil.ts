/**
 * 执行异步替换
 * @param text 要替换的文本
 * @param regex 替换正则
 * @param asyncReplacement 一步替换函数
 */
export async function asyncReplaceAll(
    text: string, regex: RegExp, asyncReplacement: (substring: string) => Promise<string>): Promise<string> {
    const matches = text.match(regex);

    if (!matches) {
        return text;
    }

    const replacedTextArray = await Promise.all(matches.map(asyncReplacement));

    let index = 0;
    return text.replace(regex, () => replacedTextArray[index++]);
}

export function isEmptyString(str: any): boolean {
    if (typeof str === 'undefined') {
        return true
    } else if (typeof str !== 'string') {
        str = `${str}`;
    }
    return str.length === 0;
}

export function isNotEmptyString(str: any): boolean {
    return !isEmptyString(str);
}
