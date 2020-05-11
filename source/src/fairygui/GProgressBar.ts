namespace fgui {
    export class GProgressBar extends GComponent {
        private _min: number = 0;
        private _max: number = 0;
        private _value: number = 0;
        private _titleType: number;
        private _reverse: boolean;

        private _titleObject: GObject;
        private _aniObject: GObject;
        private _barObjectH: GObject;
        private _barObjectV: GObject;
        private _barMaxWidth: number = 0;
        private _barMaxHeight: number = 0;
        private _barMaxWidthDelta: number = 0;
        private _barMaxHeightDelta: number = 0;
        private _barStartX: number = 0;
        private _barStartY: number = 0;

        constructor() {
            super();

            this._titleType = ProgressTitleType.Percent;
            this._value = 50;
            this._max = 100;
        }

        public get titleType(): number {
            return this._titleType;
        }

        public set titleType(value: number) {
            if (this._titleType != value) {
                this._titleType = value;
                this.update(value);
            }
        }

        public get min(): number {
            return this._min;
        }

        public set min(value: number) {
            if (this._min != value) {
                this._min = value;
                this.update(this._value);
            }
        }

        public get max(): number {
            return this._max;
        }

        public set max(value: number) {
            if (this._max != value) {
                this._max = value;
                this.update(this._value);
            }
        }

        public get value(): number {
            return this._value;
        }

        public set value(value: number) {
            if(value == Infinity || value == NaN) {
                value = 0
            } 

            if (this._value != value) {
                GTween.kill(this, false, this.update);

                this._value = value;
                this.update(value);
            }
        }

        public tweenValue(value: number, duration: number): GTweener {
            var oldValule: number;

            var tweener: GTweener = GTween.getTween(this, this.update);
            if (tweener != null) {
                oldValule = tweener.value.x;
                tweener.kill();
            }
            else
                oldValule = this._value;

            this._value = value;
            return GTween.to(oldValule, this._value, duration).setTarget(this, this.update).setEase(EaseType.Linear);
        }

        public update(newValue: number): void {
            var percent: number = ToolSet.clamp01((newValue - this._min) / (this._max - this._min));
            if (this._titleObject) {
                switch (this._titleType) {
                    case ProgressTitleType.Percent:
                        this._titleObject.text = Math.floor(percent * 100) + "%";
                        break;

                    case ProgressTitleType.ValueAndMax:
                        this._titleObject.text = Math.floor(newValue) + "/" + Math.floor(this._max);
                        break;

                    case ProgressTitleType.Value:
                        this._titleObject.text = "" + Math.floor(newValue);
                        break;

                    case ProgressTitleType.Max:
                        this._titleObject.text = "" + Math.floor(this._max);
                        break;
                }
            }

            var fullWidth: number = this.width - this._barMaxWidthDelta;
            var fullHeight: number = this.height - this._barMaxHeightDelta;
            var minPercenterBUG = 0.01
            if (!this._reverse) {
                if (this._barObjectH) {
                    if ((this._barObjectH instanceof GImage) && this._barObjectH.fillMethod != FillMethod.None)
                    {
                       var _v = Math.max(minPercenterBUG,percent)
                       if(_v <= minPercenterBUG) {
                            this._barObjectH.visible = false
                       } else {
                            this._barObjectH.visible = true
                            this._barObjectH.fillAmount = _v;
                       }
                    }
                    else
                        this._barObjectH.width = Math.floor(fullWidth * percent);
                }
                if (this._barObjectV) {
                    if ((this._barObjectV instanceof GImage) && this._barObjectV.fillMethod != FillMethod.None)
                    {
                        var _v = Math.max(minPercenterBUG,percent);
                        if(_v <= minPercenterBUG) {
                            this._barObjectV.visible = false
                        } else {
                            this._barObjectV.visible = true
                            this._barObjectV.fillAmount = _v
                        }
                    }
                    else
                        this._barObjectV.height = Math.floor(fullHeight * percent);
                }
            }
            else {
                if (this._barObjectH) {
                    if ((this._barObjectH instanceof GImage) && this._barObjectH.fillMethod != FillMethod.None)
                    {
                        var _v = Math.max(minPercenterBUG,1 - percent);
                        if(_v <= minPercenterBUG) {
                            this._barObjectH.visible = false
                        } else {
                            this._barObjectH.visible = true
                            this._barObjectH.fillAmount = _v
                        }
                    }
                    else {
                        this._barObjectH.width = Math.floor(fullWidth * percent);
                        this._barObjectH.x = this._barStartX + (fullWidth - this._barObjectH.width);
                    }
                }
                if (this._barObjectV) {
                    if ((this._barObjectV instanceof GImage) && this._barObjectV.fillMethod != FillMethod.None)
                    {
                        var _v = Math.max(minPercenterBUG,1 - percent);
                        if(_v <= minPercenterBUG) {
                            this._barObjectV.visible = false
                        } else {
                            this._barObjectV.visible = true
                            this._barObjectV.fillAmount = _v
                        }
                    }
                    else {
                        this._barObjectV.height = Math.floor(fullHeight * percent);
                        this._barObjectV.y = this._barStartY + (fullHeight - this._barObjectV.height);
                    }
                }
            }
            if (this._aniObject)
                this._aniObject.setProp(ObjectPropID.Frame, Math.floor(percent * 100));
        }

        protected constructExtension(buffer: ByteBuffer): void {
            buffer.seek(0, 6);

            this._titleType = buffer.readByte();
            this._reverse = buffer.readBool();

            this._titleObject = this.getChild("title");
            this._barObjectH = this.getChild("bar");
            this._barObjectV = this.getChild("bar_v");
            this._aniObject = this.getChild("ani");

            if (this._barObjectH) {
                this._barMaxWidth = this._barObjectH.width;
                this._barMaxWidthDelta = this.width - this._barMaxWidth;
                this._barStartX = this._barObjectH.x;
            }
            if (this._barObjectV) {
                this._barMaxHeight = this._barObjectV.height;
                this._barMaxHeightDelta = this.height - this._barMaxHeight;
                this._barStartY = this._barObjectV.y;
            }
        }

        protected handleSizeChanged(): void {
            super.handleSizeChanged();

            if (this._barObjectH)
                this._barMaxWidth = this.width - this._barMaxWidthDelta;
            if (this._barObjectV)
                this._barMaxHeight = this.height - this._barMaxHeightDelta;
            if (!this._underConstruct)
                this.update(this._value);
        }

        public setup_afterAdd(buffer: ByteBuffer, beginPos: number): void {
            super.setup_afterAdd(buffer, beginPos);

            if (!buffer.seek(beginPos, 6)) {
                this.update(this._value);
                return;
            }

            if (buffer.readByte() != this.packageItem.objectType) {
                this.update(this._value);
                return;
            }

            this._value = buffer.getInt32();
            this._max = buffer.getInt32();
            if (buffer.version >= 2)
                this._min = buffer.getInt32();

            this.update(this._value);
        }
    }
}