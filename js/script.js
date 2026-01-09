$(function () {
  // load data
  // member data load
  /*
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
  */
  // console.table(getMem())
  // console.log(getMem().length)
  // string
  // console.log(getMem()[1][0])

  // prefectures data load
  /*
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
  */
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

  function getParam(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
    var results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  }

  // 勢力状態保持
  const currentAreaState = {};

  let isInitialized = false;

  function updateMapFromJson(isInitial = false) {
    $.getJSON('/db/map-status.json', function (data) {

      $('.region').each(function () {
        const $el = $(this);
        const code = $el.data('code');
        if (!code) return;

        const forceId = data.areas[code];
        const color = data.forces[forceId];
        if (!forceId || !color) return;

        const prev = currentAreaState[code];

        // 初期 or 未記録
        if (isInitial || !prev) {
          setRegionFill($el, color);
          currentAreaState[code] = forceId;
          return;
        }

        // 勢力変化
        if (prev !== forceId) {
          currentAreaState[code] = forceId;

          // 白フラッシュ
          setRegionFill($el, '#ffffff');

          setTimeout(() => {
            setRegionFill($el, color);
            $el.css({
              filter: 'brightness(1.5)',
              'stroke-width': '5'
            });
          }, 80);

          setTimeout(() => {
            $el.css({
              filter: '',
              'stroke-width': ''
            });
          }, 600);
        }
      });
    });
  }

  function setRegionFill($region, color) {
    if ($region.prop('tagName').toLowerCase() === 'path' ||
      $region.prop('tagName').toLowerCase() === 'polygon') {
      $region[0].style.setProperty('fill', color, 'important');
    } else {
      $region.find('path, polygon').each(function () {
        this.style.setProperty('fill', color, 'important');
      });
    }
  }

  // 初回描画
  $(window).on('load', function () {
    setTimeout(function () {
      updateMapFromJson();
    }, 50);
  });

  // OBSモード判定
  if (getParam('obs') === 'true') {
    $('body').addClass('obs');

    setInterval(function () {
      updateMapFromJson();
      console.log('json reload');
    }, 300000);
    // }, 6000);
  }

  const svg = document.getElementById("japan-map");

  svg.querySelectorAll("[data-name]").forEach(el => {
    const box = el.getBBox();

    const text = document.createElementNS(
      "http://www.w3.org/2000/svg", "text"
    );

    text.textContent = el.dataset.name;
    text.setAttribute("x", box.x + box.width / 2);
    text.setAttribute("y", box.y + box.height / 2.2);
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("dominant-baseline", "central");
    text.setAttribute("font-size", "40");
    text.setAttribute("font-weight", "bold");
    text.setAttribute("fill", "#333");
    text.setAttribute("fill", "#333");
    text.style.pointerEvents = "none";
    text.setAttribute("filter", "url(#text-shadow)");
    text.style.paintOrder = "stroke";
    text.setAttribute("stroke", "#fff");
    text.setAttribute("stroke-width", "2");
    svg.appendChild(text);
  });

  const list = document.getElementById("mergeList");
  let offset = 0;

  setInterval(() => {
    offset += 1;
    list.style.transform = `translateY(-${offset}px)`;

    // 1行分スクロールしたら先頭を末尾へ
    if (offset >= list.children[0].offsetHeight) {
      list.appendChild(list.children[0]);
      offset = 0;
      list.style.transform = `translateY(0)`;
    }
  }, 40); // 数値を大きくするとゆっくり
});