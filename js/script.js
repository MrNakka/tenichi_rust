$(function () {
  // load data
  // member data load
  var memberCsv = '/db/whitelist.csv';
  function getMem(url) {
    //CSVファイルを文字列で取得。
    var txt = new XMLHttpRequest();
    txt.open('get', memberCsv, false);
    txt.send();
    var arr = txt.responseText.split('\n');
    var res = [];
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] == '') break;
      res[i] = arr[i].replace(/\r\n|\r|\n/g, '').split(',');
    }
    return res;
  }
  // console.table(getMem())
  // console.log(getMem().length)
  // string
  // console.log(getMem()[1][0])

  // prefectures data load
  var prefCsv = '/db/prefectures.csv';
  function getPref(url) {
    //CSVファイルを文字列で取得。
    var txt = new XMLHttpRequest();
    txt.open('get', prefCsv, false);
    txt.send();
    var arr = txt.responseText.split('\n');
    var res = [];
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] == '') break;
      res[i] = arr[i].replace(/\r\n|\r|\n/g, '').split(',');
    }
    return res;
  }
  
  for (var i = 1; i < getPref().length; i++){
    console.log('ClanTag '+ getPref()[i][2])
    $('[data-code="' + i + '"]').addClass(getPref()[i][2]);
  }
  // console.table(getPref())
  // console.log(getPref().length)
  // string
  // console.log(getPref()[1][0])

  // 5mim load
  // var clanJson = '/tenichi_rust/db/ClansList.json';
  // $.getJSON(clanJson, function (clansData) {
  //   console.log(clansData)
  //   // steam id
  //   // console.log(clansData[0].Members[0])
  //   // string
  //   console.log(String(clansData[0].Members[0]))
  //   var steamidClan
  //   // var stemidMem = $.inArray(String(clansData[0].Members[0]), getCsv())

  //   // 0 ~ 121
  //   // $.each(getCsv(), function (key, value) {
  //   //   console.log(value.match(String(clansData[0].Members[0])))
  //   //   // if () {
  //   //   //   console.log('aaaaa'+key);
  //   //   // }
  //   // });
  // });



  // param for obs
  function getParam(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  }
  var param = location.search;
  console.log(param)
  if (getParam('obs') === "true") {
    $('body').addClass('obs');
    // 5min reload
    setTimeout(function () {
      location.reload();
      console.log('reload')
    }, 300000);
  }
});