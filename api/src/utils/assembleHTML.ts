import cheerio from "cheerio";
import { joinUrl } from "@/store/assetsPath";

/**
 * article的article字段中的get
 * @params str {string} 需要查询的文章内容字符串
 * @params type {string} 文章类型字符串
 * @return html {html} 处理好的HTML字符串
 */
function html(str: string, type: string): string {
  let $ = cheerio.load(str);
  $("img").each((index, data) => {
    //没有http说明是网络图片
    if (!$(data).attr("src")?.includes("http")) {
      let _src: string = joinUrl("article", $(data).attr("src") + "", true);
      $(data).attr("data-src", _src).removeAttr("src").attr("alt", type);
    }
  });

  $("pre").each((index, el) => {
    let allClassNames = `${$(el).attr("class")} ${$(el)
      .children("code")
      .eq(0)
      .attr("class")}`.split(" ");
    let hasClassNames = allClassNames.find(item => item.includes("language-"));
    let language = hasClassNames ? hasClassNames.replace("language-", "") : false;
    if (language) {
      $(el).addClass(`language-${language} line-numbers`);
    }
  });

  $("a").attr("rel", "noopener noreferrer nofollow");
  return $("body").html() as string;
}
export default html;
