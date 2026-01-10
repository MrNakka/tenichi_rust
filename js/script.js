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

  // マップ更新＋ニュース生成
  function updateMapFromJson(isInitial = false) {
    $.getJSON('/db/map-status.json', function (data) {

      // 勢力ごとの地域数を集計
      const forceCount = {};
      for (const code in data.areas) {
        const forceId = data.areas[code];
        if (!forceCount[forceId]) forceCount[forceId] = 0;
        forceCount[forceId]++;
      }

      $('.region').each(function () {
        const $el = $(this);
        const code = $el.data('name');
        if (!code) return;

        const newForce = data.areas[code];
        const color = data.forces[newForce];
        if (!newForce || !color) return;

        // 色はCSS変数に入れるだけ
        $el.css('--region-color', color);

        // 統治判定
        const isMerged = code !== newForce;
        $el.toggleClass('is-merged', isMerged);
        $el.toggleClass('is-origin', !isMerged);

        // オーバーレイ処理
        if (isMerged) {
          if (!$el.data('mergedOverlay')) {
            const $overlay = $el.clone(false);
            $overlay
              .removeAttr('style')
              .removeAttr('fill')
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

        // --- ニュース生成 ---
        const oldForce = currentAreaState[code];
        const count = forceCount[newForce];
        // 勢力が2県以上かつ、自分自身が統治していない場合だけニュース生成
        if (count > 1 && code !== newForce && (isInitial || (oldForce && oldForce !== newForce))) {
          const regionName = code; // 必要なら都道府県名マッピングに置換
          const forceName = newForce; // 必要なら勢力名マッピングに置換
          const text = `${regionName} は ${forceName} に併合されました（勢力${count}県）`;

          addMergeNews(text);
        }

        // 状態更新
        currentAreaState[code] = newForce;
      });
    });
  }

  // ニュースフィード追加関数
  function addMergeNews(text) {
    const list = document.getElementById("mergeList");
    if (!list) return;

    const li = document.createElement("li");
    li.textContent = text;
    li.className = "merge-item";

    list.prepend(li);
  }

  // 初回描画
  $(window).on('load', function () {
    setTimeout(function () {
      updateMapFromJson(true);
      updateNewsFeedFromJson();
    }, 50);
  });

  // OBSモード判定
  if (getParam('obs') === 'true') {
    $('body').addClass('obs');

    setInterval(function () {
      updateMapFromJson(true);
      updateNewsFeedFromJson();
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

  // DOM取得
  const feed = document.querySelector(".merge-feed");
  const list = document.getElementById("mergeList");

  let itemHeight = 0;
  let autoScroll = true;
  let pauseTimer = null;

  // 高さ更新関数
  function updateItemHeight() {
    if (list && list.children.length > 0) {
      itemHeight = list.children[0].offsetHeight;
    }
  }

  // 初期停止（最新を見せる）
  setTimeout(() => {
    autoScroll = true;
    updateItemHeight(); // 初期ロード時も高さ更新
  }, 2400);

  function autoScrollStep() {
    if (!autoScroll || itemHeight === 0) return; // 高さ0なら無効

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

  // 自動スクロール開始
  setInterval(autoScrollStep, 60);

  // ユーザー操作で一時停止
  ["wheel", "touchstart", "mousedown"].forEach(evt => {
    feed.addEventListener(evt, () => {
      autoScroll = false;
      clearTimeout(pauseTimer);
      pauseTimer = setTimeout(() => { autoScroll = true; }, 1000);
    });
  });

  // --- 重要 ---
  // ニュース追加時に itemHeight を更新
  function addMergeNews(text) {
    if (!list) return;

    const li = document.createElement("li");
    li.textContent = text;
    li.className = "merge-item";

    list.prepend(li);

    // 高さ再取得
    updateItemHeight();
  }

});