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
        const code = $el.data('name');
        if (!code) return;

        const forceId = data.areas[code];
        const color = data.forces[forceId];
        if (!forceId || !color) return;

        // 色はCSS変数に入れるだけ
        $el.css('--region-color', color);

        // 統治判定
        const isMerged = code !== forceId;
        $el.toggleClass('is-merged', isMerged);
        $el.toggleClass('is-origin', !isMerged);

        if (isMerged) {
          if (!$el.data('mergedOverlay')) {
            const $overlay = $el.clone(false);

            $overlay
              .removeAttr('style') // OK
              .removeAttr('fill') // ← 重要
              .css({
                fill: 'url(#merged-pattern)',
                pointerEvents: 'none'
              })
              .addClass('merged-overlay');

            $el.after($overlay);
            $el.data('mergedOverlay', $overlay);
          }
        } else {
          const $overlay = $el.data('mergedOverlay');
          if ($overlay) {
            $overlay.remove();
            $el.removeData('mergedOverlay');
          }
        }

        currentAreaState[code] = forceId;
      });
    });
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

  // log
  const feed = document.querySelector(".merge-feed");
  const list = document.getElementById("mergeList");
  const itemHeight = list.children[0].offsetHeight;

  let autoScroll = true;
  let pauseTimer = null;

  // 初期停止（最新を見せる）
  setTimeout(() => autoScroll = true, 2400);

  function autoScrollStep() {
    if (!autoScroll) return;

    feed.scrollTop += 1;

    // 行単位で停止
    if (feed.scrollTop % itemHeight === 0) {
      autoScroll = false;

      pauseTimer = setTimeout(() => {
        autoScroll = true;
      }, 900);
    }

    // 最下部に到達したらトップへ
    if (feed.scrollTop + feed.clientHeight >= feed.scrollHeight) {
      autoScroll = false;

      setTimeout(() => {
        feed.scrollTop = 0;
        autoScroll = true;
      }, 6000);
    }
  }

  // 自動スクロール
  setInterval(autoScrollStep, 60);

  // ユーザー操作検知（重要）
  ["wheel", "touchstart", "mousedown"].forEach(evt => {
    feed.addEventListener(evt, () => {
      autoScroll = false;
      clearTimeout(pauseTimer);

      // 一定時間後に自動再開
      pauseTimer = setTimeout(() => {
        autoScroll = true;
      }, 1000);
    });
  });
});