const { removePunctuationAfterQuotes } = require("./src/formatter");

const testRemovePunctuation = () => {
  const textSamples = [
    "「こんにちは。」",
    "『ありがとう、世界。』",
    "（よろしくお願いします。）",
    "(Please check this out.)",
    "「こんにちは、」『ありがとう。』（よろしく。）(Check this.)",
  ];

  textSamples.forEach((text) => {
    const result = removePunctuationAfterQuotes(text);
    console.log(`Input: ${text}`);
    console.log(`Result: ${result}`);
  });
};

testRemovePunctuation();
