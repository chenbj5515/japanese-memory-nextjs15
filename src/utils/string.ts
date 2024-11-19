export function transformString(input: string) {
    let result = input.trim();

    result = result.replace(/\(.*?\)/g, "").trim();

    result = result.replace(/\s+/g, "、");

    const quoteIndex = result.indexOf("“");
    if (quoteIndex !== -1) {
        result = result.slice(quoteIndex + 1);
    }

    return result;
}
// const input = '这是一个(测试)字符串 “包含 引号” 和括号的内容';
// console.log(transformString(input));


export function containsKanji(input: string) {
    // 使用正则表达式匹配日文汉字的Unicode范围
    const kanjiRegex = /[\u4e00-\u9faf\u3400-\u4dbf]/;
    return kanjiRegex.test(input);
}