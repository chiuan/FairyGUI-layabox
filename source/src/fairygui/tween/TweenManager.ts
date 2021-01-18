namespace fgui {
    export class TweenManager {
        public static createTween(isOnTimer: boolean = false): GTweener {
            if (!_inited) {
                Laya.systemTimer.frameLoop(1, this, TweenManager.update);
                Laya.timer.frameLoop(1, this, TweenManager.update_timer);
                _inited = true;
            }

            var tweener: GTweener;
            var cnt: number = _tweenerPool.length;
            if (cnt > 0) {
                tweener = _tweenerPool.pop();
            }
            else
                tweener = new GTweener();
            tweener._init();

            if (isOnTimer) {
                _activeTweens_timer[_totalActiveTweens_timer++] = tweener;
            } else {
                _activeTweens[_totalActiveTweens++] = tweener;
            }

            return tweener;
        }

        public static isTweening(target: any, propType: any): boolean {
            if (target == null)
                return false;

            var anyType: boolean = !propType;
            for (var i: number = 0; i < _totalActiveTweens; i++) {
                var tweener: GTweener = _activeTweens[i];
                if (tweener && tweener.target == target && !tweener._killed
                    && (anyType || tweener._propType == propType))
                    return true;
            }

            for (var i: number = 0; i < _totalActiveTweens_timer; i++) {
                var tweener: GTweener = _activeTweens_timer[i];
                if (tweener && tweener.target == target && !tweener._killed
                    && (anyType || tweener._propType == propType))
                    return true;
            }

            return false;
        }

        public static killTweens(target: any, completed: boolean, propType: any): boolean {
            if (target == null)
                return false;

            var flag: boolean = false;
            var anyType: boolean = !propType;
            var cnt: number = _totalActiveTweens;
            for (var i: number = 0; i < cnt; i++) {
                var tweener: GTweener = _activeTweens[i];
                if (tweener && tweener.target == target && !tweener._killed
                    && (anyType || tweener._propType == propType)) {
                    tweener.kill(completed);
                    flag = true;
                }
            }

            var cnt: number = _totalActiveTweens_timer;
            for (var i: number = 0; i < cnt; i++) {
                var tweener: GTweener = _activeTweens_timer[i];
                if (tweener && tweener.target == target && !tweener._killed
                    && (anyType || tweener._propType == propType)) {
                    tweener.kill(completed);
                    flag = true;
                }
            }

            return flag;
        }

        public static getTween(target: any, propType: any): GTweener {
            if (target == null)
                return null;

            var anyType: boolean = !propType;
            var cnt: number = _totalActiveTweens;
            for (var i: number = 0; i < cnt; i++) {
                var tweener: GTweener = _activeTweens[i];
                if (tweener && tweener.target == target && !tweener._killed
                    && (anyType || tweener._propType == propType)) {
                    return tweener;
                }
            }

            var cnt: number = _totalActiveTweens_timer;
            for (var i: number = 0; i < cnt; i++) {
                var tweener: GTweener = _activeTweens_timer[i];
                if (tweener && tweener.target == target && !tweener._killed
                    && (anyType || tweener._propType == propType)) {
                    return tweener;
                }
            }

            return null;
        }

        public static update_timer(): void {
            var dt: number = Laya.timer.delta / 1000;

            var cnt: number = _totalActiveTweens_timer;
            var freePosStart: number = -1;
            for (var i: number = 0; i < cnt; i++) {
                var tweener: GTweener = _activeTweens_timer[i];
                if (tweener == null) {
                    if (freePosStart == -1)
                        freePosStart = i;
                }
                else if (tweener._killed) {
                    tweener._reset();
                    _tweenerPool.push(tweener);
                    _activeTweens_timer[i] = null;

                    if (freePosStart == -1)
                        freePosStart = i;
                }
                else {
                    if ((tweener._target instanceof GObject) && tweener._target.isDisposed)
                        tweener._killed = true;
                    else if (!tweener._paused)
                        tweener._update(dt);

                    if (freePosStart != -1) {
                        _activeTweens_timer[freePosStart] = tweener;
                        _activeTweens_timer[i] = null;
                        freePosStart++;
                    }
                }
            }

            if (freePosStart >= 0) {
                if (_totalActiveTweens_timer != cnt) //new tweens added
                {
                    var j: number = cnt;
                    cnt = _totalActiveTweens_timer - cnt;
                    for (i = 0; i < cnt; i++)
                        _activeTweens_timer[freePosStart++] = _activeTweens_timer[j++];
                }
                _totalActiveTweens_timer = freePosStart;
            }
        }

        public static update(): void {
            var dt: number = Laya.systemTimer.delta / 1000;

            var cnt: number = _totalActiveTweens;
            var freePosStart: number = -1;
            for (var i: number = 0; i < cnt; i++) {
                var tweener: GTweener = _activeTweens[i];
                if (tweener == null) {
                    if (freePosStart == -1)
                        freePosStart = i;
                }
                else if (tweener._killed) {
                    tweener._reset();
                    _tweenerPool.push(tweener);
                    _activeTweens[i] = null;

                    if (freePosStart == -1)
                        freePosStart = i;
                }
                else {
                    if ((tweener._target instanceof GObject) && tweener._target.isDisposed)
                        tweener._killed = true;
                    else if (!tweener._paused)
                        tweener._update(dt);

                    if (freePosStart != -1) {
                        _activeTweens[freePosStart] = tweener;
                        _activeTweens[i] = null;
                        freePosStart++;
                    }
                }
            }

            if (freePosStart >= 0) {
                if (_totalActiveTweens != cnt) //new tweens added
                {
                    var j: number = cnt;
                    cnt = _totalActiveTweens - cnt;
                    for (i = 0; i < cnt; i++)
                        _activeTweens[freePosStart++] = _activeTweens[j++];
                }
                _totalActiveTweens = freePosStart;
            }
        }
    }

    var _activeTweens: GTweener[] = [];
    var _activeTweens_timer: GTweener[] = []; // 在timer更新的tween
    var _tweenerPool: GTweener[] = [];
    var _totalActiveTweens: number = 0;
    var _totalActiveTweens_timer: number = 0; // 在timer下激活的tween数量
    var _inited: boolean = false;
}