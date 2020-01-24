const DatePicker = (function () {

    // Build Calendar
    const Calendar = {
        // Get current date
        date: new Date(),

        // Get day of the week
        day: function () {
            return this.date.getDay();
        },

        // Get today day
        today: function () {
            return this.date.getDate();
        },

        // Get current month
        month: function () {
            return this.date.getMonth();
        },

        // Get current year
        year: function () {
            return this.date.getFullYear();
        },

        getCurrentYear: function () {
            return new Date().getFullYear();
        },

        rowPadding: function () {
            const startWeekDay = getWeekDay(1, this.month(), this.year());
            return [6, 0, 1, 2, 3, 4, 5][startWeekDay];
        },

        // Build calendar header
        buildHeader: function () {
            return '<div class="datepicker__header">' +
                '<div class="datepicker__arrow datepicker__arrow--prev"></div>' +
                '<div class="datepicker__date">' + this.buildMonths() +
                '&nbsp;&nbsp;' + this.buildYears() + '</div>' +
                '<div class="datepicker__arrow datepicker__arrow--next"></div></div>';
        },

        // Build months select
        buildMonths: function () {
            let elem = '<select class="datepicker__date--month">';
            const month = this.month();
            for (let i = 0; i < months.length; i++) {
                elem += '<option value="' + i + '"';
                if (i === month) {
                    elem += ' selected';
                }
                elem += '>' + months[i] + "</option>";
            }
            elem += '</select>';
            return elem;
        },

        // Build years select
        buildYears: function () {
            let elem = '<select class="datepicker__date--year">';
            const currentYear = this.getCurrentYear();
            const year = this.year();
            for (let i = year - 20; i <= currentYear + 5; i++) {
                elem += '<option value="' + i + '"';
                if (i === year) {
                    elem += ' selected';
                }
                elem += '>' + i + '</option>';
            }
            elem += '</select>';
            return elem;
        },

        // Build calendar body
        buildCalendar: function () {
            let index;
            const daysInMonth = getDaysInMonth(this.year(), this.month());
            let template = '<div class="datepicker__calendar"><table><tr>';
            for (index = 0; index < weeks.length; index++) {
                template += '<td><div class="datepicker__week">' + weeks[index] + '</div></td>';
            }
            template += '</tr><tr>';
            let columnIndex = 0, dayClass = '';
            let day = 0 - this.rowPadding();
            for (; day < daysInMonth; day++) {
                if (day < 0) {
                    template += '<td></td>';
                } else {
                    dayClass = day === (this.today() - 1) ? 'datepicker__day--today' : '';
                    template += '<td><div class="datepicker__day ' + dayClass + '" ';
                    template += 'data-day="' + (day + 1) + '" data-month="' + (this.month() + 1);
                    template += '" data-year="' + this.year() + '" ';
                    template += '>' + (day + 1) + '</div></td>';
                }
                columnIndex++;
                if (columnIndex % 7 === 0) {
                    columnIndex = 0;
                    template += '</tr><tr>';
                }
            }
            template += '</tr></table></div>';
            return template;
        },

        // Header click listeners
        addListeners: function (instance) {
            const id = instance.options.id;
            const pickerDiv = document.getElementById('datepicker-' + id);
            if (pickerDiv) {
                const prevBtn = pickerDiv.getElementsByClassName('datepicker__arrow--prev')[0];
                const nextBtn = pickerDiv.getElementsByClassName('datepicker__arrow--next')[0];
                addEvent(prevBtn, 'click', instance.changeMonth, false);
                addEvent(nextBtn, 'click', instance.changeMonth, false);

                const monthSelect = pickerDiv.getElementsByClassName('datepicker__date--month')[0];
                const yearSelect = pickerDiv.getElementsByClassName('datepicker__date--year')[0];

                // add event listener for month change
                addEvent(monthSelect, 'change', this.handleMonthChange.bind(null, instance), false);

                // add event listener for year change
                addEvent(yearSelect, 'change', this.handleYearChange.bind(null, instance), false);
            }

            this.changeInstanceDate(instance);
            this.modifyDateClass(instance);

            const el = pickerDiv.getElementsByClassName('datepicker__day');
            if (el && el.length) {
                for (let count = 0; count < el.length; count++) {
                    if (typeof el[count].onclick !== "function") {
                        if (el[count].className && el[count].className.indexOf('datepicker__day--disabled') === -1) {
                            const elem = document.getElementById(id + '-datepicker__day--' + (count + 1));
                            addEvent(elem, 'click', instance.selectDate, false);
                        }
                    }
                }
            }
        },

        handleMonthChange: function (instance, event) {
            instance.updateCalendar(event.target.value);
        },

        handleYearChange: function (instance, event) {
            instance.updateCalendar(instance.currentMonth, event.target.value);
        },

        removeListeners: function (instance) {
            const id = instance.options.id;
            const pickerDiv = document.getElementById('datepicker-' + id);
            if (pickerDiv) {
                const monthSelect = pickerDiv.getElementsByClassName('datepicker__date--month')[0];
                const yearSelect = pickerDiv.getElementsByClassName('datepicker__date--year')[0];

                monthSelect.removeEventListener('change', this.handleMonthChange, false);
                yearSelect.removeEventListener('change', this.handleYearChange, false);
            }
        },

        modifyDateClass: function (instance) {
            const id = instance.options.id, day = instance.selectedDay;
            let currentDate, disabled;
            const date = new Date();
            const month = date.getMonth(), year = date.getFullYear();
            let dayClass;
            const pickerDiv = document.getElementById('datepicker-' + id);
            if (pickerDiv) {
                const el = pickerDiv.getElementsByClassName('datepicker__day');
                if (el && el.length) {
                    for (let count = 0; count < el.length; count++) {
                        disabled = '';
                        currentDate = format(instance, el[count].dataset.day, el[count].dataset.month,
                            el[count].dataset.year);

                        if (instance.options.disable && instance.options.disable.indexOf(currentDate) !== -1) {
                            disabled = 'datepicker__day--disabled';
                        }

                        if (instance.options.minDate) {
                            const currentDateOfDateType = new Date(
                                parseInt(el[count].dataset.year),
                                parseInt(el[count].dataset.month) - 1,
                                parseInt(el[count].dataset.day) + instance.options.minDate
                            );
                            if (currentDateOfDateType < date) {
                                disabled = 'datepicker__day--disabled';
                            }
                        }

                        el[count].className = 'datepicker__day';
                        if ((count + 1) === day && this.month() === instance.selectedMonth - 1 &&
                            this.year() === instance.selectedYear) {
                            el[count].className += ' datepicker__day--selected' + ' ' + disabled;
                        } else {
                            if (el[count].dataset.day === this.today() && month === this.month() && year === this.year()) {
                                dayClass = ' datepicker__day--today';
                            } else {
                                dayClass = '';
                            }
                            el[count].className += dayClass + ' ' + disabled;
                        }

                        if ((count + 1) === date.getDate() && this.month() === month && this.year() === year) {
                            el[count].classList.add('datepicker__day--today');
                        }
                        el[count].id = id + '-datepicker__day--' + (count + 1);
                    }
                }
            }
        },

        // Change date in instance
        changeInstanceDate: function (instance) {
            instance.currentDay = this.day();
            instance.currentDate = this.today();
            instance.currentMonth = this.month();
            instance.currentYear = this.year();
        }
    };
    'use strict';

    const hasEventListener = window.addEventListener;
    const weeks = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    const months = ['Янв', 'Фев', 'Март', 'Апр', 'Май', 'Июнь', 'Июль', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

    function DatePicker() {
        const _self = this;
        let _id;

        const defaults = {
            className: 'datepicker',
            dateFormat: 'dd-MMM-yyyy',
            disable: [],
            minDate: false
        };

        if (arguments[0] && typeof arguments[0] === "object") {
            _self.options = extendOptions(defaults, arguments[0]);
            _id = _self.options.id;
        }

        // Show date picker on click
        _self.showPicker = function () {
            _self.buildPicker();
            const pickerField = document.getElementById(_id);
            const pickerDiv = document.getElementById('datepicker-' + _id);
            if (pickerField) {
                const datepicker = pickerField.getBoundingClientRect();
                const left = datepicker.left;
                const top = datepicker.bottom - 7;
                if (pickerDiv) {
                    pickerDiv.style.position = 'fixed';
                    pickerDiv.style.top = top + 'px';
                    pickerDiv.style.left = left + 'px';
                    pickerDiv.style.zIndex = '99999';
                }
            }
        };

        // Hide date picker
        _self.hidePicker = function (event) {
            setTimeout(function () {
                let pickerDiv, pickerField;
                if (!_self.monthChange && !_self.isPickerClicked) {
                    _self.removeListeners(_id);
                    pickerDiv = document.getElementById('datepicker-' + _id);
                    pickerDiv.removeEventListener('click', self.handlePickerClick, false);
                    if (pickerDiv) {
                        pickerDiv.innerHTML = '';
                    }
                    _self.isDateClicked = false;
                } else if (!_self.isPickerClicked) {
                    pickerField = document.getElementById(_self.options.id);
                    if (pickerField) {
                        pickerField.focus();
                    }
                    _self.monthChange = false;
                }
            }, 150);
        };

        // Select date
        _self.selectDate = function (event) {
            _self.monthChange = false;
            const el = document.getElementById(event.target.id);
            const pickerField = document.getElementById(_id);
            if (el) {
                el.classList.add('datepicker__day--selected');
                const date = format(_self, el.dataset.day, el.dataset.month, el.dataset.year);
                _self.selectedDate = date;
                _self.selectedDay = parseInt(el.dataset.day);
                _self.selectedMonth = parseInt(el.dataset.month);
                _self.selectedYear = parseInt(el.dataset.year);
                if (pickerField) {
                    pickerField.value = date;
                    pickerField.focus();
                    setTimeout(function () {
                        pickerField.blur();
                    }, 100);
                }
            }
            _self.isPickerClicked = false;
            _self.isDateClicked = true;
            _self.hidePicker();
        };

        _self.removeListeners = function (id) {
            const picker = document.getElementById(id);
            if (picker) {
                const el = picker.getElementsByClassName('datepicker__day');
                if (el && el.length) {
                    for (let count = 0; count < el.length; count++) {
                        if (typeof el[count].onclick === "function") {
                            const elem = document.getElementById(id + '-datepicker__day--' + (count + 1));
                            removeEvent(elem, 'click', _self.selectDate, false);
                        }
                    }
                }
            }
            document.removeEventListener('keydown', keyDownListener, false);

            const htmlRoot = document.getElementsByTagName('html')[0];
            htmlRoot.removeEventListener('click', _self.handleDocumentClick, false);
        };

        _self.changeMonth = function (event) {
            const className = event.target.className;
            let positive = false;
            if (className.indexOf('datepicker__arrow--next') !== -1) {
                positive = true;
            }
            const month = positive ? _self.currentMonth + 1 : _self.currentMonth - 1;
            _self.updateCalendar(month);
        };

        _self.updateCalendar = function (newMonth, newYear) {
            _self.monthChange = true;
            const day = _self.currentDate;
            const year = newYear || _self.currentYear;
            _self.currentMonth = newMonth;
            Calendar.date = new Date(year, newMonth, day);
            const pickerDiv = document.getElementById('datepicker-' + _id);
            if (pickerDiv) {
                const datepicker = pickerDiv.querySelector('.datepicker');
                datepicker.innerHTML = Calendar.buildHeader() + Calendar.buildCalendar();
                _self.isPickerClicked = false;
                Calendar.removeListeners(_self);
                Calendar.addListeners(_self);
            }
        };

        _self.buildPicker = function () {
            const pickerDiv = document.getElementById('datepicker-' + _id);
            const pickerField = document.getElementById(_id);
            if (pickerDiv && !hasPicker(pickerDiv)) {
                let fragment, datepicker, calendar;
                fragment = document.createDocumentFragment();
                datepicker = document.createElement('div');
                // Add default class name
                datepicker.className = _self.options.className;

                // Date is selected show that month calendar
                let date;
                if (pickerField && pickerField.value && pickerField.value.length >= 10) {
                    date = parse(_self, pickerField.value);
                    _self.selectedDay = date.getDate();
                    _self.selectedMonth = date.getMonth() + 1;
                    _self.selectedYear = date.getFullYear();
                    _self.selectedDate = format(_self, date.getDate(), date.getMonth() + 1, date.getFullYear());
                } else {
                    _self.selectedDate = null;
                    _self.selectedDay = null;
                    _self.selectedMonth = null;
                    _self.selectedYear = null;
                    date = new Date();
                }
                Calendar.date = date;

                // Add calendar to datepicker
                datepicker.innerHTML = Calendar.buildHeader() + Calendar.buildCalendar();
                // Append picker to fragment and add fragment to DOM
                fragment.appendChild(datepicker);
                pickerDiv.appendChild(fragment);

                Calendar.addListeners(_self);

                // add event listener to handle clicks anywhere on date picker
                addEvent(pickerDiv, 'click', _self.handlePickerClick, false);
            }
            document.addEventListener('keydown', keyDownListener, false);

            // Close the date picker if clicked anywhere outside the picker element
            const htmlRoot = document.getElementsByTagName('html')[0];
            addEvent(htmlRoot, 'click', _self.handleDocumentClick, false);
        };

        _self.handlePickerClick = function (event) {
            event.stopPropagation();
            if (!_self.isDateClicked) {
                _self.isPickerClicked = true;
            }
        };

        _self.handleDocumentClick = function (event) {
            const pickerField = document.getElementById(_self.options.id);
            const pickerDiv = document.getElementById('datepicker-' + _self.options.id);
            _self.isPickerClicked = false;
            _self.monthChange = false;
            if (event.target !== pickerField && event.target !== pickerDiv) {
                _self.hidePicker();
            }
        };

        _self.buildTemplate = function () {
            const pickerDiv = document.createElement('div');
            pickerDiv.id = 'datepicker-' + _id;
            document.body.appendChild(pickerDiv);
            addListeners(_self);
        };

        _self.destroy = function () {
            const pickerDiv = document.getElementById('datepicker-' + _id);
            if (pickerDiv) {
                document.body.removeChild(pickerDiv);
            }
        };

        function keyDownListener() {
            _self.monthChange = false;
            _self.hidePicker();
        }

        _self.buildTemplate();
    }

    // Date formatter
    function format(instance, day, month, year) {
        day = day < 10 ? '0' + day : day;
        month = month < 10 ? '0' + month : month;
        switch (instance.options.dateFormat) {
            case 'dd-MM-yyyy':
                return day + '-' + month + '-' + year;
            case 'dd-MMM-yyyy':
                return day + '-' + getShortMonth(parseInt(month)) + '-' + year;
            case 'dd.MM.yyyy':
                return day + '.' + month + '.' + year;
            case 'dd.MMM.yyyy':
                return day + '.' + getShortMonth(parseInt(month)) + '.' + year;
            case 'dd/MM/yyyy':
                return day + '/' + month + '/' + year;
            case 'dd/MMM/yyyy':
                return day + '/' + getShortMonth(parseInt(month)) + '/' + year;
            case 'MM-dd-yyyy':
                return month + '-' + day + '-' + year;
            case 'MM.dd.yyyy':
                return month + '.' + day + '.' + year;
            case 'MM/dd/yyyy':
                return month + '/' + day + '/' + year;
            case 'yyyy-MM-dd':
                return year + '-' + month + '-' + day;
            case 'yyyy-MMM-dd':
                return year + '-' + getShortMonth(parseInt(month)) + '-' + day;
            case 'yyyy.MM.dd':
                return year + '.' + month + '.' + day;
            case 'yyyy.MMM.dd':
                return year + '.' + getShortMonth(parseInt(month)) + '.' + day;
            case 'yyyy/MM/dd':
                return year + '/' + month + '/' + day;
            case 'yyyy/MMM/dd':
                return year + '/' + getShortMonth(parseInt(month)) + '/' + day;
            default:
                return day + '-' + getShortMonth(parseInt(month)) + '-' + year;
        }
    }

    // Date parser
    function parse(instance, value) {
        let date, dateArray;
        switch (instance.options.dateFormat) {
            case 'dd-MM-yyyy':
                dateArray = value.split('-');
                date = new Date(parseInt(dateArray[2]), parseInt(dateArray[1]) - 1, parseInt(dateArray[0]));
                return date;
            case 'dd-MMM-yyyy':
                dateArray = value.split('-');
                date = new Date(parseInt(dateArray[2]), getMonthNumber(dateArray[1]), parseInt(dateArray[0]));
                return date;
            case 'dd.MM.yyyy':
                dateArray = value.split('.');
                date = new Date(parseInt(dateArray[2]), parseInt(dateArray[1]) - 1, parseInt(dateArray[0]));
                return date;
            case 'dd.MMM.yyyy':
                dateArray = value.split('.');
                date = new Date(parseInt(dateArray[2]), getMonthNumber(dateArray[1]), parseInt(dateArray[0]));
                return date;
            case 'dd/MM/yyyy':
                dateArray = value.split('/');
                date = new Date(parseInt(dateArray[2]), parseInt(dateArray[1]) - 1, parseInt(dateArray[0]));
                return date;
            case 'dd/MMM/yyyy':
                dateArray = value.split('/');
                date = new Date(parseInt(dateArray[2]), getMonthNumber(dateArray[1]), parseInt(dateArray[0]));
                return date;
            case 'MM-dd-yyyy':
                dateArray = value.split('-');
                date = new Date(parseInt(dateArray[2]), parseInt(dateArray[0]) - 1, parseInt(dateArray[1]));
                return date;
            case 'MM.dd.yyyy':
                dateArray = value.split('.');
                date = new Date(parseInt(dateArray[2]), parseInt(dateArray[0]) - 1, parseInt(dateArray[1]));
                return date;
            case 'MM/dd/yyyy':
                dateArray = value.split('/');
                date = new Date(parseInt(dateArray[2]), parseInt(dateArray[0]) - 1, parseInt(dateArray[1]));
                return date;
            case 'yyyy-MM-dd':
                dateArray = value.split('-');
                date = new Date(parseInt(dateArray[0]), parseInt(dateArray[1]) - 1, parseInt(dateArray[2]));
                return date;
            case 'yyyy-MMM-dd':
                dateArray = value.split('-');
                date = new Date(parseInt(dateArray[0]), getMonthNumber(dateArray[1]), parseInt(dateArray[2]));
                return date;
            case 'yyyy.MM.dd':
                dateArray = value.split('.');
                date = new Date(parseInt(dateArray[0]), parseInt(dateArray[1]) - 1, parseInt(dateArray[2]));
                return date;
            case 'yyyy.MMM.dd':
                dateArray = value.split('.');
                date = new Date(parseInt(dateArray[0]), getMonthNumber(dateArray[1]), parseInt(dateArray[2]));
                return date;
            case 'yyyy/MM/dd':
                dateArray = value.split('/');
                date = new Date(parseInt(dateArray[0]), parseInt(dateArray[1]) - 1, parseInt(dateArray[2]));
                return date;
            case 'yyyy/MMM/dd':
                dateArray = value.split('/');
                date = new Date(parseInt(dateArray[0]), getMonthNumber(dateArray[1]), parseInt(dateArray[2]));
                return date;
            default:
                dateArray = value.split('-');
                date = new Date(parseInt(dateArray[2]), getMonthNumber(dateArray[1]), parseInt(dateArray[0]));
                return date;
        }
    }

    // Extend default options
    function extendOptions(defaults, options) {
        let property;
        for (property in options) {
            if (options.hasOwnProperty(property)) {
                defaults[property] = options[property];
            }
        }
        return defaults;
    }

    function addListeners(picker) {
        const el = document.getElementById(picker.options.id);
        if (el) {
            addEvent(el, 'click', picker.showPicker, false);
            // addEvent(el, 'blur', picker.hidePicker, false);
        }
    }

    function getShortMonth(month) {
        return months[parseInt(month) - 1];
    }

    function getMonthNumber(month) {
        const formatted = month.charAt(0).toUpperCase() + month.substr(1, month.length - 1).toLowerCase();
        return months.indexOf(formatted);
    }

    function getDaysInMonth(year, month) {
        return [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
    }

    function getWeekDay(date, month, year) {
        return new Date(year, month, date).getDay();
    }

    // Check if current year is leap year
    function isLeapYear(year) {
        return year % 100 === 0 ? year % 400 === 0 : year % 4 === 0;
    }

    // Check if datepicker is already built and added to DOM
    function hasPicker(el) {
        return !!(el && el.querySelector('.datepicker'));
    }

    // Function to add events
    function addEvent(el, type, callback, capture) {
        if (hasEventListener) {
            if (el) {
                el.addEventListener(type, callback, capture);
            }
        }
    }

    // Function to remove events
    function removeEvent(el, type, callback, capture) {
        if (hasEventListener) {
            if (el) {
                el.removeEventListener(type, callback, capture);
            }
        }
    }

    return DatePicker;
})();

export default DatePicker;
