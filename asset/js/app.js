var hp = {
    set() {
        if (localStorage['lData'] == undefined) {
            hp.lData = {};
        } else {
            hp.lData = JSON.parse(localStorage['lData']);
        }

        $.getJSON('/asset/json/hot.json', data => {
            data.imgs.forEach((val, key) => {
                $('.hWrap .listWrap').append(`<div onclick="hp.setImg('./asset/img/${data.imgdir}${val.name}', '${val.name.replace('.png', '').replace('.jpg', '')}');" style="background: url(/asset/img/${data.imgdir}${val.name}) no-repeat -200px -200px/800px;"></div>`);
                if (val.name.indexOf(hp.lData.tName) != -1) hp.setImg(`./asset/img/${data.imgdir}${val.name}`, `${val.name.replace('.png', '').replace('.jpg', '')}`);
            });
        });

        hp.setEvt();
    },
    setPoi() {
        $('.lWrap').empty();
        $('.cWrap .poi, .pPos').remove();
        
        Object.keys(hp.lData[hp.lData.tName].poi).forEach(val => {
            var th = hp.lData[hp.lData.tName].poi[val];

            $(`.${th.cntr}`).append(`<div id="${val.replace('poi', 'pos')}" class="pPos" style="position:absolute; top:${th.top}px; left:${th.left}px; width:1px;height:1px;"></div>`);

            var top = $(`#${val.replace('poi', 'pos')}`).offset().top;
            var left = $(`#${val.replace('poi', 'pos')}`).offset().left;

            $('.cWrap').append(`
                        <div class="poi" id="${val}" style="top:${top}px; left:${left}px;">
                            <img src="./asset/img/spot.png" alt="">
                            <div class="info">
                                <strong>${th.hName}</strong>
                                <p>${th.hCont}</p>
                            </div>
                        </div>`);

            $('.lWrap').append(`
                    <div class="row">
                        <a href="javascript:;" onclick="hp.movePoi('${val}');">${th.hName}</a>
                        <button onclick="hp.delPoi('${val}');">삭제</button>
                    </div>`);
        });

        hp.setPoiPos();
    },
    mvpTimer: null,
    movePoi(_id) {
        clearTimeout(hp.mvpTimer);
        var mvX = hp.lData[hp.lData.tName].poi[_id].rX;
        var mvY = hp.lData[hp.lData.tName].poi[_id].rY;
        var stt = 0;
        hp.mvpTimer = setInterval(() => {
            if (stt == 0) {
                if (Math.floor(hp.rX) < mvX - 5) {
                    hp.rX++;
                } else if (Math.floor(hp.rX) > mvX + 5) {
                    hp.rX--;
                } else {
                    stt++;
                }
            }

            if (stt == 1) {
                if (Math.floor(hp.rY) < mvY - 5) {
                    hp.rY++;
                } else if (Math.floor(hp.rY) > mvY + 5) {
                    hp.rY--;
                } else {
                    stt++;
                }
            }

            if (stt == 2) {
                if ($(`#${_id}`).position().top > 410) {
                    hp.rY--;
                } else if ($(`#${_id}`).position().top < 390) {
                    hp.rY++;
                } else {
                    stt++;
                }
            }

            if (stt == 3) {
                if ($(`#${_id}`).position().left > 410) {
                    hp.rX++;
                } else if ($(`#${_id}`).position().left < 390) {
                    hp.rX--;
                } else {
                    stt++;
                }
            }

            if (stt == 4) {
                clearTimeout(hp.mvpTimer);
            }

            $('.pWrap').css('transform', `rotateX(${hp.rY}deg) rotateY(${hp.rX}deg) scale(${hp.rZ})`);

            hp.setPoiPos();
        }, 1);
    },
    delPoi(_id) {
        delete hp.lData[hp.lData.tName].poi[_id];
        localStorage['lData'] = JSON.stringify(hp.lData);
        hp.setPoi();
    },
    setImg(_path, _name) {
        $('.aName').html(_name);
        $('.hName, .hCont').val('');

        hp.lData.tName = _name;

        if (hp.lData[_name] == undefined) {
            hp.lData[_name] = {
                poi: {},
            };
        }

        $('.pWrap').html(`<div class="front" style="background: url(${_path}) no-repeat -2000px -2000px;"></div>
                        <div class="back" style="background: url(${_path}) no-repeat -6000px -2000px;"></div>
                        <div class="left" style="background: url(${_path}) no-repeat 0px -2000px;"></div>
                        <div class="right" style="background: url(${_path}) no-repeat -4000px -2000px;"></div>
                        <div class="top" style="background: url(${_path}) no-repeat -2000px 0px;"></div>
                        <div class="bottom" style="background: url(${_path}) no-repeat -2000px -4000px;"></div>`);

        $('.spot').mousedown(e => {
            hp.mpS = true;
        });

        $('.spot').mouseup(e => {
            hp.mpS = false;
        });

        $('.pWrap>div').mousemove(e => {
            if (hp.mpS) {
                hp.mpS = false;
                var cntr = $(e.target).attr('class');

                hp.lData[hp.lData.tName].poi[`${cntr}_poi_${Object.keys(hp.lData[hp.lData.tName].poi).length}`] = {
                    cntr: cntr,
                    top: e.offsetY,
                    left: e.offsetX,
                    hName: $('.hName').val(),
                    hCont: $('.hCont').val(),
                    rX: hp.rX || 0,
                    rY: hp.rY || 0,
                }

                $('.hName, .hCont').val('');

                localStorage['lData'] = JSON.stringify(hp.lData);

                hp.setPoi();
            }
        })

        hp.setPoi();

        hp.rX = 0;
        hp.rY = 0;
        hp.rZ = 1;

        $('.pWrap').css('transform', `rotateX(${hp.rY}deg) rotateY(${hp.rX}deg) scale(${hp.rZ})`);
    },
    setEvt() {
        $('.cWrap').mousedown(e => {
            hp.mSt = true;
            hp.mX = e.pageX;
            hp.mY = e.pageY;
        });

        $('.cWrap').on('mouseup mouseleave', e => {
            hp.mSt = false;
            hp.rX = hp.rXTmp;
            hp.rY = hp.rYTmp;
        });

        $('.cWrap').mousemove(e => {
            if (hp.mSt) {
                var mvX = (e.pageX - hp.mX) / 5;
                var mvY = (e.pageY - hp.mY) / 5;

                if (hp.rX == undefined) {
                    hp.rX = 0;
                    hp.rY = 0;
                    hp.rZ = 1;
                }

                var roX = hp.rX - mvX;
                if (roX >= 300) {
                    roX = -60;
                    hp.rX = mvX - 60;
                }

                if (roX <= -300) {
                    roX = 60;
                    hp.rX = mvX + 60;
                }

                var roY = hp.rY + mvY;
                if (roY >= 300) {
                    roY = -60;
                    hp.rY = -mvY - 60;
                }

                if (roY <= -300) {
                    roY = 60;
                    hp.rY = -mvY + 60;
                }

                $('.pWrap').css('transform', `rotateX(${roY}deg) rotateY(${roX}deg) scale(${hp.rZ})`);

                hp.rXTmp = roX;
                hp.rYTmp = roY;

                hp.setPoiPos();
            }
        });

        $('.cWrap').on('mousewheel', e => {
            e.preventDefault();

            var type = e.originalEvent.wheelDelta;
            if (type > 0) { // up
                hp.rZ = hp.rZ >= 3 ? 3 : hp.rZ + 1;
            } else { // down
                hp.rZ = hp.rZ <= 1 ? 1 : hp.rZ - 1;
            }

            $('.pWrap').css('transform', `rotateX(${hp.rY}deg) rotateY(${hp.rX}deg) scale(${hp.rZ})`);
        });
    },
    setPoiPos() {
        Object.keys(hp.lData[hp.lData.tName].poi).forEach(val => {
            var top = $(`#${val.replace('poi', 'pos')}`).offset().top - $('.cWrap').offset().top;
            var left = $(`#${val.replace('poi', 'pos')}`).offset().left - $('.cWrap').offset().left;

            if (
                -100 > $(`#${val.replace('poi', 'pos')}`).position().top ||
                20000 < $(`#${val.replace('poi', 'pos')}`).position().top ||
                -100 > $(`#${val.replace('poi', 'pos')}`).position().left ||
                20000 < $(`#${val.replace('poi', 'pos')}`).position().left
            ) {
                $(`#${val}`).css('opacity', '0');
            } else {
                $(`#${val}`).css('opacity', '1');
            }

            $(`#${val}`).css({
                top: `${top}px`,
                left: `${left}px`,
            });
        });
    }
}

var kw = {
    set() {
        $.getJSON('/asset/json/keywords.json', data => {
            kw.tData = data.data.sort((a, b) => b.frequency - a.frequency);

            kw.tData.forEach(val => {
                val.color = [Math.random() * 255, Math.random() * 255, Math.random() * 255];

                $('.kWrap .tWrap tbody').append(`<tr>
                                                    <td><input type="checkbox" data-word="${val.word}" data-fre="${val.frequency}" data-color="${val.color[0]}, ${val.color[1]}, ${val.color[2]}" checked></td>
                                                    <td style="font-weight:bold; color:rgb(${val.color[0]}, ${val.color[1]}, ${val.color[2]})">${val.word}</td>
                                                    <td>${Number(val.frequency).toLocaleString('ko-KR')}</td>
                                                </tr>`);
            });

            kw.setWC();
        });

        $(document).on('click', '.tWrap input', kw.setOn);
    },
    setWC() {
        var cEl = $('.wcWrap')[0];
        $(cEl).empty();
        var cntX = cEl.clientWidth / 2;
        var cntY = cEl.clientHeight / 2;

        var wArr = [];
        kw.tData.forEach((val, key) => {
            var fontSize = 64 - key * 2;

            var angle = (key / kw.tData.length) * 2 * Math.PI;
            var radius = ((key + 1) * 10);
            var x, y, coll, el;

            do {
                angle += 1;
                radius += 1;
    
                x = cntX + radius * Math.cos(angle) - 50;
                y = cntY + radius * Math.sin(angle) - 30;
    
                el = $(`<div class="word" data-word="${val.word}" style="font-size:${fontSize}px; color:rgb(${val.color[0]}, ${val.color[1]}, ${val.color[2]}); left:${x}px; top:${y}px;">${val.word}<span>빈도수 : ${Number(val.frequency).toLocaleString('ko-KR')}</span></div>`)[0];
                cEl.append(el);
    
                coll = false;
                for(var wd of wArr) {
                    if (kw.isColl(el, wd)) {
                        coll = true;
                        $(cEl).find(`[data-word="${val.word}"]`).remove();
                        break;
                    }
                }
            } while (coll);

            cEl.append(el);
            wArr.push(el);
        });

        kw.setChart();
    },
    isColl(_el, _wd) {
        var rect1 = _el.getBoundingClientRect();
        var rect2 = _wd.getBoundingClientRect();

        return !(
            rect1.right < rect2.left ||
            rect1.left > rect2.right ||
            rect1.bottom < rect2.top ||
            rect1.top > rect2.bottom
        );
    },
    setOn(e) {
        if ($('.tWrap input:checked').length == 14) {
            e.preventDefault();
            return false;
        }

        var kData = [];
        $('.tWrap input').each(function() {
            if ($(this).prop('checked')) {
                var c = $(this).data('color').split(',');
                kData.push({
                    word: $(this).data('word'),
                    frequency: $(this).data('fre'),
                    color: [c[0], c[1], c[2]],
                })
            }
        });

        kw.tData = kData;

        kw.setWC();
    },
    setChart() {
        $('.cht').empty();
        kw.tData.forEach(val => {
            $('.cht').append(`<div>
                                    <div class="stk" data-fre="${val.frequency}" style="height:calc(${val.frequency / kw.tData[0].frequency * 100}% - 20px); background-color:rgb(${val.color[0]}, ${val.color[1]}, ${val.color[2]});"><span>${Number(val.frequency).toLocaleString('ko-KR')}</span></div>
                                    <p class="str">${val.word}</p>
                                </div>`);
        });

        $('.chart .yMx p').html((Math.floor(kw.tData[0].frequency / 100) * 100).toLocaleString('ko-KR'));

        kw.mvIdx = 0;
        kw.mvChart();
    },
    mvChart(_type = '') {
        if (_type == 'left') {
            kw.mvIdx -= 1;
        } else if(_type == 'right') {
            kw.mvIdx += 1;
        }

        if (kw.mvIdx == 0) {
            $('.chWrap .left').hide();
        } else {
            $('.chWrap .left').show();
        }

        if (kw.mvIdx >= kw.tData.length - 14) {
            $('.chWrap .right').hide();
        } else {
            $('.chWrap .right').show();
        }

        $('.cht').css('left', `-${70 * kw.mvIdx}px`);

        $('.cht>div').each(function() {
            var stk = $('.stk', this);
            stk.css('height', `calc(${Number(stk.data('fre') / kw.tData[kw.mvIdx].frequency * 100)}% - 20px)`);
        });

        $('.chart .yMx p').html((Math.floor(kw.tData[kw.mvIdx].frequency / 100) * 100).toLocaleString('ko-KR'));
    }
}