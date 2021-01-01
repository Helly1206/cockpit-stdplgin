/*********************************************************
 * SCRIPT : stdplgin-common.js                           *
 *          Javascript for standard plugin               *
 *          Cockpit web-gui (common functions)           *
 *          I. Helwegen 2020                             *
 *********************************************************/

class tabPane {
    constructor(caller, el, id) {
        this.caller = caller;
        this.el = el;
        this.id = id;
        this.container = null;
        this.paneltitle = null;
        this.panelactions = null;
        this.table = null;
        this.settings = null;
        this.loadingSpinner = new spinnerLoading();
    }

    build(spinnerText = "", settings = false) {
        this.dispose();

        this.container = document.createElement("div");
        this.container.id = "panel-container-" + this.id;

        // build standard panel heading
        var heading = document.createElement("div");
        heading.classList.add("panel-heading");
        var ctheading = document.createElement("div");
        ctheading.classList.add("panel-ct-heading");
        var h2 = document.createElement("h2");
        h2.id = "paneltitle-" + this.id;
        h2.classList.add("panel-title");
        ctheading.appendChild(h2);
        heading.appendChild(ctheading);
        this.paneltitle = h2;

        var ctactions = document.createElement("div");
        ctactions.classList.add("panel-heading-actions");
        ctactions.classList.add("panel-ct-actions");
        heading.appendChild(ctactions);
        this.panelactions = ctactions;

        this.container.appendChild(heading);

        this.showSpinner(spinnerText);

        var fluid = document.createElement("div");
        fluid.classList.add("container-fluid");
        this.container.appendChild(fluid);
        if (settings) {
            this.settings = new settingsEditForm(this, this.disposeSpinner);
            fluid.appendChild(this.settings.create());
        } else {
            // build standard table
            this.table = new dataTable(this, this.disposeSpinner);
            fluid.appendChild(this.table.create());
        }

        this.el.appendChild(this.container);
    }

    dispose() {
        while (this.el.firstChild) {
            this.el.firstChild.remove();
        }
    }

    showSpinner(spinnerText = "") {
        if (this.container) {
            if (this.table) {
                this.table.setLoadingClickable(false);
            }
            this.container.insertBefore(this.loadingSpinner.build(spinnerText), this.container.firstChild.nextSibling);
        }
    }

    disposeSpinner() {
        if (this.table) {
            this.table.setLoadingClickable(true);
        }
        this.loadingSpinner.dispose();
    }

    addButton(name, text, onClick, primary, disabled, privileged) {
        var btnClick = function() {
            if (onClick != null) {
                onClick.call(this.caller);
            }
        };
        var btn = document.createElement("button");
        btn.id = "btn-panel+" + this.id + "-" + name;
        btn.classList.add("btn");
        this.setButtonPrimary(btn, primary);
        this.setButtonDisabled(btn, disabled);
        this.setButtonPrivileged(btn, privileged);
        btn.type="button";
        btn.innerHTML = text;
        btn.addEventListener("click", btnClick.bind(this) );
        btn.addEventListener("mouseup", function() { this.blur() });
        this.panelactions.appendChild(btn);

        return btn;
    }

    setButtonPrimary(btn, primary) {
        if (btn != null) {
            if (primary) {
                btn.classList.remove("btn-default");
                btn.classList.add("btn-primary");
            } else {
                btn.classList.remove("btn-primary");
                btn.classList.add("btn-default");
            }
        }
    }

    setButtonDisabled(btn, disabled) {
        if (btn != null) {
            if (disabled) {
                btn.classList.add("disabled");
            } else {
                btn.classList.remove("disabled");
            }
        }
    }

    setButtonPrivileged(btn, privileged) {
        if (btn != null) {
            if (privileged) {
                btn.classList.add("privileged");
            } else {
                btn.classList.remove("privileged");
            }
        }
    }

    getTitle() {
        return this.paneltitle;
    }

    getActions() {
        return this.panelactions;
    }

    getTable() {
        return this.table;
    }

    getSettingsEditForm() {
        return this.settings;
    }
}

class spinnerLoading {
    constructor() {
        this.obj = null;
    }

    build(text = "Loading...") {
        if (this.obj) {
            this.dispose();
        }
        if (!text) {
            text = "Loading...";
        }
        this.obj = document.createElement("div");
        this.obj.classList.add("loading-ct");
        var spinner = document.createElement("div");
        spinner.classList.add("spinner");
        spinner.classList.add("spinner-lg");
        var span = document.createElement("SPAN");
        span.innerHTML = text;
        this.obj.appendChild(spinner);
        this.obj.appendChild(span);

        return this.obj;
    }

    dispose() {
        if (this.obj) {
            while (this.obj.firstChild) {
                this.obj.firstChild.remove();
            }
            this.obj.remove();
            this.obj = null;
        }
    }
}

class dataTable {
    constructor(parent, callback) {
        this.panel = null;
        this.table = null;
        this.thead = null;
        this.tbody = null;
        this.clickable = false;
        this.parent = parent;
        this.callback = callback;
        this.onClick = null;
        this.dropDown = null;
    }

    create() {
        this.panel = document.createElement("div");
        this.table = document.createElement("TABLE");
        this.table.setAttribute("id", "dataTable");
        this.table.classList.add("table");
        this.table.classList.add("table-hover");
        this.clickable = true;
        this.LoadingClickable = true;

        this.thead = document.createElement("THEAD");
        this.table.appendChild(this.thead);

        this.tbody = document.createElement("TBODY");
        this.table.appendChild(this.tbody);

        this.panel.appendChild(this.table);

        return this.panel;
    }

    dispose() {
        this.panel.classList.remove("panel-table");
        this.panel.classList.remove("panel-default");
        while (this.thead.firstChild) {
            this.thead.firstChild.remove()
        }
        while (this.tbody.firstChild) {
            this.tbody.firstChild.remove()
        }
    }

    setData(data) {
        this.callback.call(this.parent);
        this.dispose();
        if (data.length > 0) {
            this.panel.classList.add("panel-table");
            this.panel.classList.add("panel-default");
            this.panel.classList.remove("messageText");
            this.setHeader(data);
            data.forEach(item => this.setRow(item));
        } else {
            this.panel.classList.add("panel-table");
            this.panel.classList.add("panel-default");
            this.panel.classList.add("messageText");
            this.panel.innerHTML = "No data";
        }
    }

    setJsonData(data) {
        this.setData(JSON.parse(data));
    }

    setClickable(value) {
        if (value) {
            this.table.classList.add("table-hover");
            this.clickable = true;
        } else {
            this.table.classList.remove("table-hover");
            this.clickable = false;
        }
    }

    setLoadingClickable(value) {
        if (value) {
            if (this.clickable) {
                this.table.classList.add("table-hover");
            }
            this.LoadingClickable = true;
        } else {
            this.table.classList.remove("table-hover");
            this.LoadingClickable = false;
        }


    }

    setOnClick(onClick) {
        this.onClick = onClick;
    }

    setDropDown(dropDown) {
        this.dropDown = dropDown;
    }

    setHeader(tableData) {
        var keys = Object.keys(tableData[0]);
        var row = document.createElement("TR");
        row.setAttribute("id", "dataTable-headerRow");
        this.thead.appendChild(row);

        keys.forEach(item => {
            let cell = document.createElement("TH");
            cell.innerHTML = item;
            if (item.charAt(0) == "!") {
                cell.classList.add("hidden");
            }
            if (typeof tableData[0][item] === "boolean") {
                cell.classList.add("alignCenter");
            } else if (Array.isArray(tableData[0][item])) {
                if (typeof tableData[0][item][0] === "boolean") {
                    cell.classList.add("alignCenter");
                }
            }
            row.appendChild(cell);
        });

        if (this.dropDown != null) {
            let cell = document.createElement("TH");
            cell.innerHTML = "";
            row.appendChild(cell);
        }
    }

    loadingDone() {
        Array.from(this.tbody.children).forEach((row) => {
            row.classList.remove("loading");
        });
    }

    setRow(rowData) {
        var keys = Object.keys(rowData);
        var row = document.createElement("TR");
        var onRowClicked = function(event) {
            if ((this.onClick) && (this.clickable) && (this.LoadingClickable)) {
                row.classList.add("loading");
                this.onClick.call(this.parent.caller, this.generateRowData(row));
            }
        };
        row.setAttribute("id", "dataTable-row-"+rowData[keys[0]]);
        this.tbody.appendChild(row);

        keys.forEach(item => {
            let cell = document.createElement("TD");
            if (Array.isArray(rowData[item])) {
                let text = "";
                let newline = false;
                rowData[item].forEach(cellItem => {
                    if (newline) {
                        this.setCellValue(cell, "<br>");
                    } else {
                        newline = true;
                    }
                    this.setCellValue(cell, cellItem);
                });
            } else {
                this.setCellValue(cell, rowData[item]);
            }
            if (item.charAt(0) == "!") {
                cell.classList.add("hidden");
            }
            row.appendChild(cell);
        });

        if (this.dropDown != null) {
            this.setDropDownButton(row);
        }

        var cols = row.querySelectorAll("td:not(.listing-ct-actionsmenu)");
        cols.forEach(col => col.addEventListener("click", onRowClicked.bind(this)));
    }

    setCellValue(cell, value) {
        if (typeof value === "boolean") {
            var span = document.createElement("span");
            span.classList.add("pficon");
            if (value) {
                span.classList.add("pficon-ok");
                span.classList.add("true");
            } else {
                span.classList.add("pficon-error-circle-o");
                span.classList.add("false");
            }
            span.classList.add("list-view-pf-icon-sm");
            cell.classList.add("alignCenter");
            cell.appendChild(span);
        } else if (value == "N/A") {
            var span = document.createElement("span");
            span.classList.add("pficon");
            span.classList.add("pficon-unknown");
            span.classList.add("list-view-pf-icon-sm");
            cell.classList.add("alignCenter");
            span.classList.add("na");
            cell.appendChild(span);
        } else {
            var span = document.createElement("span");
            span.innerHTML = value;
            cell.appendChild(span);
        }
    }

    setDropDownButton(row) {
        var dropdown = document.createElement("div");
        var btn = document.createElement("button");
        var btnClick = function(event) {
            if (btn.contains(event.target)) {
                if (dropdown.classList.contains("open")) { //close
                    dropdown.classList.remove("open");
                    btn.setAttribute("aria-expanded", false);
                } else { //open
                    dropdown.classList.add("open");
                    btn.setAttribute("aria-expanded", true);
                }
            }
            else {
                dropdown.classList.remove("open");
                btn.setAttribute("aria-expanded", false);
            }
        };

        var cell = document.createElement("TD");
        cell.id = "cell-dropdown-stdplgin";
        cell.classList.add("listing-ct-actionsmenu");

        dropdown.classList.add("dropdown");
        dropdown.classList.add("dropdown-kebab-pf");

        btn.id = "btn-dropdown-stdplgin";
        btn.setAttribute("aria-expanded", false);
        btn.setAttribute("aria-haspopup", true);
        btn.classList.add("btn");
        btn.classList.add("btn-default");
        btn.classList.add("dropdown-toggle");
        btn.setAttribute("data-toggle", "dropdown");
        btn.setAttribute("tabindex", -1);
        btn.type="button";

        document.addEventListener("click", btnClick.bind(this) );
        btn.addEventListener("mouseup", function() { this.blur() });

        var btnspan = document.createElement("span");
        btnspan.classList.add("fa");
        btnspan.classList.add("fa-ellipsis-v");

        var ul = document.createElement("ul");
        ul.classList.add("dropdown-menu");
        ul.classList.add("dropdown-menu-right");
        btn.setAttribute("aria-labelledby", "btn-dropdown-stdplgin");

        this.addDropdownElements(row, ul);
        btn.appendChild(btnspan);
        dropdown.appendChild(btn);
        dropdown.appendChild(ul);
        cell.appendChild(dropdown);
        row.appendChild(cell);
    }

    addDropdownElements(row, ul) {
        this.dropDown.forEach(item => {
            if ('name' in item) {
                let li = document.createElement("li");
                let rowData = this.generateRowData(row);
                if (('disable' in item) && ('disableValue' in item)) {
                    let disable = false;
                    if (item.disable != null) {
                        if (item.disableValue == null) {
                            disable = true;
                        } else {
                            if (item.disable in rowData) {
                                disable = String(rowData[item.disable]) == String(item.disableValue);
                            }
                        }
                    }
                    if (disable) {
                        li.classList.add("disabled");
                    }
                }
                let a = document.createElement("a");
                a.id = item.name;
                a.setAttribute("data-toggle", "modal");
                a.setAttribute("tabindex", -1);
                a.innerHTML = item.name;
                if ('callback' in item) {
                    let cb = item.callback;
                    let optionClick = function() {
                        if (cb != null) {
                            cb.call(this.parent.caller, rowData);
                        };
                    }
                    li.addEventListener("click", optionClick.bind(this) );
                }
                li.appendChild(a);
                ul.appendChild(li);
            }
        });
    }

    generateRowData(row) {
        var rowData = {};

        Array.from(row.cells).forEach((cell, i) => {
            if (cell.id != "cell-dropdown-stdplgin") {
                let value = [];
                Array.from(cell.children).forEach((child) => {
                    if (child.nodeName == "SPAN") {
                        if (child.classList.contains("na")) {
                            value.push("N/A");
                        } else if (child.classList.contains("true")) {
                            value.push(true);
                        } else if (child.classList.contains("false")) {
                            value.push(false);
                        } else if (child.innerHTML != "<br>") {
                            value.push(child.innerHTML);
                        }
                    }
                });
                if (value.length < 2) {
                    value = value[0];
                }
                rowData[this.thead.rows[0].cells[i].innerHTML] = value;
            }
        });
        return rowData;
    }
}

class editForm {
    constructor(caller, parent = null) {
        this.caller = caller;
        if (parent == null) {
            this.parent = this.caller;
        } else {
            this.parent = parent;
        }
    }

    setFormData(data) {
        this.caller.dataForm.classList.add("ct-form");
        data.forEach(datum => {
            let label = document.createElement("LABEL");
            label.classList.add("control-label");
            label.innerHTML = datum.text;
            let inputField = document.createElement("div");
            inputField.classList.add("ct-validation-wrapper");
            let inputData = null;
            switch(datum.type) {
                case "text":
                    inputData = this.inputText(datum);
                    break;
                case "multi":
                    inputData = this.inputMulti(datum);
                    break;
                case "ip":
                    inputData = this.inputIp(datum);
                    break;
                case "object":
                    inputData = this.inputObject(datum);
                    break;
                case "password":
                    inputData = this.inputPassword(datum);
                    break;
                case "file":
                    inputData = this.inputFile(datum);
                    break;
                case "boolean":
                    inputData = this.inputBoolean(datum);
                    break;
                case "number":
                    inputData = this.inputNumber(datum);
                    break;
                case "select":
                    inputData = this.inputSelect(datum);
                    break;
                case "disk":
                    inputData = this.inputDisk(datum);
                    break;
                default:
                    inputData = document.createElement("div");
                    inputData.innerHTML = datum.value;
            }
            inputField.appendChild(inputData);
            this.caller.dataForm.appendChild(label);
            this.caller.dataForm.appendChild(inputField);
        });

        this.caller.modalBody.appendChild(this.caller.dataForm);
    }

    inputText(datum) {
        var inputDiv = document.createElement("div");
        var inputData = null;
        if (datum.readonly) {
            inputData = document.createElement("div");
            inputData.setAttribute("data-field", datum.param);
            inputData.setAttribute("data-field-type", "text");
            inputData.innerHTML = datum.value;
        } else {
            inputData = document.createElement("INPUT");
            inputData.classList.add("form-control");
            inputData.disabled = datum.disabled;
            inputData.setAttribute("data-field", datum.param);
            inputData.setAttribute("data-field-type", "text");
            inputData.setAttribute("type", "text");
            inputData.value = datum.value;
            if ('onchange' in datum) {
                inputData.onchange = function() {
                    datum.onchange.call(this.parent.caller, datum.param, inputData.value);
                }.bind(this);
            }
        }
        inputDiv.appendChild(inputData);
        if ('comment' in datum) {
            var commentSpan = document.createElement("SPAN");
            commentSpan.classList.add("comment");
            commentSpan.innerHTML = datum.comment;
            inputDiv.appendChild(commentSpan);
        }
        return inputDiv;
    }

    inputMulti(datum) {
        var inputDiv = document.createElement("div");
        var inputData = null;
        if (datum.readonly) {
            inputData = document.createElement("div");
            inputData.setAttribute("data-field", datum.param);
            inputData.setAttribute("data-field-type", "multi");
            inputData.innerHTML = datum.value.join(", ");
        } else {
            inputData = document.createElement("INPUT");
            inputData.classList.add("form-control");
            inputData.disabled = datum.disabled;
            inputData.setAttribute("data-field", datum.param);
            inputData.setAttribute("data-field-type", "multi");
            inputData.setAttribute("type", "multi");
            inputData.value = datum.value.join(", ");
            if ('onchange' in datum) {
                inputData.onchange = function() {
                    datum.onchange.call(this.parent.caller, datum.param, inputData.value);
                }.bind(this);
            }
        }
        inputDiv.appendChild(inputData);
        if ('comment' in datum) {
            var commentSpan = document.createElement("SPAN");
            commentSpan.classList.add("comment");
            commentSpan.innerHTML = datum.comment;
            inputDiv.appendChild(commentSpan);
        }
        return inputDiv;
    }

    inputIp(datum) {
        var inputDiv = document.createElement("div");
        var inputData = null;
        if (datum.readonly) {
            inputData = document.createElement("div");
            inputData.setAttribute("data-field", datum.param);
            inputData.setAttribute("data-field-type", "ip");
            inputData.innerHTML = datum.value;
        } else {
            let ipArray = this.ip2array(datum.value);
            inputData = document.createElement("div");
            inputData.classList.add("form-control");
            inputData.setAttribute("data-field", datum.param);
            inputData.setAttribute("data-field-type", "ip");
            for (var i = 0; i < 4; i++) {
                var inputIp = document.createElement("INPUT");
                inputIp.classList.add("ip-item");
                inputIp.setAttribute("type", "number");
                inputIp.setAttribute("maxlength", 3);
                inputIp.setAttribute("data-field1", datum.param);
                inputIp.setAttribute("index", i);
                inputIp.setAttribute("min", 0);
                inputIp.setAttribute("max", 255);
                inputIp.setAttribute("step", 1);
                inputIp.disabled = datum.disabled;
                inputIp.value = ipArray[i];
                inputIp.onkeyup = function() {
                    if (this.value.length >= this.maxLength) {
                        if (Number(this.value) > 255) {
                            this.value = 255;
                        } else if (Number(this.value) < 0) {
                            this.value = 0;
                        } else if (Number(this.value).toFixed() != Number(this.value)) {
                            this.value = Number(this.value).toFixed();
                        }
                        let q = inputData.querySelector('[data-field1="'+datum.param+'"][index="'+(Number(this.getAttribute("Index"))+1).toString()+'"]');
                        if (q) {
                            q.focus();
                        }
                    }
                }
                inputData.appendChild(inputIp);
                if (i < 3) {
                    var textnode = document.createTextNode(".");
                    inputData.appendChild(textnode);
                }
            }
            if (('showmask' in datum) && (datum.showmask)) {
                var textnode = document.createTextNode("/");
                inputData.appendChild(textnode);
                var inputIp = document.createElement("INPUT");
                inputIp.classList.add("ip-item");
                inputIp.setAttribute("type", "number");
                inputIp.setAttribute("maxlength", 2);
                inputIp.setAttribute("data-field1", datum.param);
                inputIp.setAttribute("index", 4);
                inputIp.setAttribute("min", 0);
                inputIp.setAttribute("max", 32);
                inputIp.setAttribute("step", 1);
                inputIp.disabled = datum.disabled;
                inputIp.value = ipArray[4];
                inputIp.onkeyup = function() {
                    if (this.value.length >= this.maxLength) {
                        if (Number(this.value) > 32) {
                            this.value = 32;
                        } else if (Number(this.value) < 0) {
                            this.value = 0;
                        } else if (Number(this.value).toFixed() != Number(this.value)) {
                            this.value = Number(this.value).toFixed();
                        }
                    }
                }
                inputData.appendChild(inputIp);
            }

            if ('onchange' in datum) {
                inputData.onchange = function() {
                    var data = [];
                    data[0] = inputData.querySelector('[data-field1="'+datum.param+'"][index="0"]').value;
                    data[1] = inputData.querySelector('[data-field1="'+datum.param+'"][index="1"]').value;
                    data[2] = inputData.querySelector('[data-field1="'+datum.param+'"][index="2"]').value;
                    data[3] = inputData.querySelector('[data-field1="'+datum.param+'"][index="3"]').value;
                    if (('showmask' in datum) && (datum.showmask)) {
                        data[4] = inputData.querySelector('[data-field1="'+datum.param+'"][index="4"]').value;
                    }
                    datum.onchange.call(this.parent.caller, datum.param, this.array2ip(data));
                }.bind(this);
            }
        }
        inputDiv.appendChild(inputData);
        if ('comment' in datum) {
            var commentSpan = document.createElement("SPAN");
            commentSpan.classList.add("comment");
            commentSpan.innerHTML = datum.comment;
            inputDiv.appendChild(commentSpan);
        }
        return inputDiv;
    }

    ip2array(ip) {
        var data = [];
        var ipMask = ip.split("/");

        data[0] = 0;
        data[1] = 0;
        data[2] = 0;
        data[3] = 0;
        data[4] = 32;

        if (ipMask.length > 0) {
            let ipSplit = ipMask[0].split(".");
            let i = 0;
            ipSplit.forEach(item => {
                data[i] = Number(item);
                i++;
            });
        }

        if (ipMask.length > 1) {
            data[4] = Number(ipMask[1]);
        }

        return data;
    }

    array2ip(data) {
        var ip = "";
        if (data.length > 3) {
            ip = data[0].toString();
            ip += "." + data[1].toString();
            ip += "." + data[2].toString();
            ip += "." + data[3].toString();
        }
        if (data.length > 4) {
            ip += "/" + data[4].toString();
        }
        return ip;
    }

    inputObject(datum) {
        var inputDiv = document.createElement("div");
        var inputData = null;
        inputData = document.createElement("TEXTAREA");
        inputData.classList.add("form-control");
        inputData.classList.add("textarea_fixed");
        inputData.rows = 5;
        inputData.disabled = datum.disabled;
        inputData.readOnly = datum.readonly;
        inputData.setAttribute("data-field", datum.param);
        inputData.setAttribute("data-field-type", "object");
        inputData.value = this.object2str(datum.value);
        if ('onchange' in datum) {
            inputData.onchange = function() {
                datum.onchange.call(this.parent.caller, datum.param, this.str2object(inputData.value));
            }.bind(this);
        }
        inputDiv.appendChild(inputData);
        if ('comment' in datum) {
            var commentSpan = document.createElement("SPAN");
            commentSpan.classList.add("comment");
            commentSpan.innerHTML = datum.comment;
            inputDiv.appendChild(commentSpan);
        }
        return inputDiv;
    }

    object2str(obj) {
        var value = [];

        for (var key in obj) {
            if (Array.isArray(obj[key])) {
                obj[key].forEach(ob => {
                    value.push(key + " = " + ob);
                });
            } else {
                value.push(key + " = " + obj[key]);
            }
        }

        return value.join("\n");
    }

    str2object(value) {
        var obj = {};
        var vals = value.split("\n");
        vals.forEach(val => {
            var items = val.split("=");
            if (items.length == 2) {
                if (items[0].trim() in obj) {
                    if (!Array.isArray(obj[items[0].trim()])) {
                        let oldObj = obj[items[0].trim()];
                        obj[items[0].trim()] = [];
                        obj[items[0].trim()].push(oldObj);
                    }
                    obj[items[0].trim()].push(items[1].trim());
                } else {
                    obj[items[0].trim()] = items[1].trim();
                }
            }
        });
        return obj;
    }

    inputPassword(datum) {
        var inputDiv = document.createElement("div");
        var passwordData = null;
        if (datum.readonly) {
            passwordData = document.createElement("div");
            passwordData.setAttribute("data-field", datum.param);
            passwordData.setAttribute("data-field-type", "password");
            passwordData.innerHTML = datum.value;
            passwordData.innerText = "";
        } else {
            passwordData = document.createElement("DIV");
            passwordData.classList.add("select-space-row");
            let inputData = document.createElement("INPUT");
            inputData.classList.add("form-control");
            inputData.disabled = datum.disabled;
            inputData.setAttribute("data-field", datum.param);
            inputData.setAttribute("data-field-type", "password");
            inputData.setAttribute("autocomplete", "off");
            inputData.setAttribute("type", "password");
            inputData.value = datum.value;
            if ('onchange' in datum) {
                inputData.onchange = function() {
                    datum.onchange.call(this.parent.caller, datum.param, inputData.value);
                }.bind(this);
            }
            let toggleField = document.createElement("i");
            toggleField.classList.add("pficon-locked");
            toggleField.onmousedown = function() {
                if (!inputData.disabled) {
                    toggleField.classList.remove("pficon-locked");
                    toggleField.classList.add("pficon-unlocked");
                    inputData.setAttribute("type", "text");
                }
            }.bind(this);
            toggleField.onmouseup = function() {
                toggleField.classList.remove("pficon-unlocked");
                toggleField.classList.add("pficon-locked");
                inputData.setAttribute("type", "password");
            }.bind(this);
            toggleField.onmouseout = function() {
                toggleField.classList.remove("pficon-unlocked");
                toggleField.classList.add("pficon-locked");
                inputData.setAttribute("type", "password");
            }.bind(this);
            passwordData.appendChild(inputData);
            passwordData.appendChild(toggleField);
        }
        inputDiv.appendChild(passwordData);
        if ('comment' in datum) {
            var commentSpan = document.createElement("SPAN");
            commentSpan.classList.add("comment");
            commentSpan.innerHTML = datum.comment;
            inputDiv.appendChild(commentSpan);
        }
        return inputDiv;
    }

    inputFile(datum) {
        var inputDiv = document.createElement("div");
        var fileData = null;
        if (datum.readonly) {
            fileData = document.createElement("div");
            fileData.setAttribute("data-field", datum.param);
            fileData.setAttribute("data-field-type", "file");
            fileData.innerHTML = datum.value;
        } else {
            fileData = document.createElement("DIV");
            fileData.classList.add("select-space-row");
            let inputData = document.createElement("INPUT");
            inputData.classList.add("form-control");
            if ('filetextedit' in datum) {
                inputData.setAttribute("readonly", (!datum.filetextedit));
            }
            inputData.disabled = datum.disabled;
            inputData.setAttribute("data-field", datum.param);
            inputData.setAttribute("data-field-type", "file");
            inputData.setAttribute("data-field-base", ('filebase' in datum) ? datum.filebase : "/");
            inputData.setAttribute("type", "text");
            inputData.value = datum.value;
            inputData.onchange = function() {
                if ('onchange' in datum) {
                    datum.onchange.call(this.parent.caller, datum.param, inputData.value);
                }
            }.bind(this);
            let fmField = document.createElement("i");
            fmField.disabled = datum.disabled;
            fmField.classList.add("pficon-folder-open");
            fmField.onclick = function() {
                if (!fmField.disabled) {
                    var cbOk = function(newPath) {
                        inputData.value = newPath;
                        inputData.onchange();
                    }
                    let title = ('alttext' in datum) ? datum.alttext : datum.text;
                    let fileOpts = {};
                    fileOpts.path = inputData.value;
                    fileOpts.dir = ('filedir' in datum) ? datum.filedir : false;
                    fileOpts.save = ('filesave' in datum) ? datum.filesave : false;
                    fileOpts.addNew = ('fileaddnew' in datum) ? datum.fileaddnew : true;
                    fileOpts.base = inputData.getAttribute("data-field-base");
                    fileOpts.relative = ('filerelative' in datum) ? datum.filerelative : false;
                    let fileDlg = new fileDialog(this, title, cbOk, null, fileOpts);
                }
            }.bind(this);
            fileData.appendChild(inputData);
            fileData.appendChild(fmField);
        }
        inputDiv.appendChild(fileData);
        if ('comment' in datum) {
            var commentSpan = document.createElement("SPAN");
            commentSpan.classList.add("comment");
            commentSpan.innerHTML = datum.comment;
            inputDiv.appendChild(commentSpan);
        }
        return inputDiv;
    }

    inputBoolean(datum) {
        var inputDiv = document.createElement("div");
        inputDiv.setAttribute("role", "group");
        var inputLabel = document.createElement("LABEL");
        inputLabel.classList.add("onoff-ct");
        inputLabel.classList.add("privileged-modal");
        inputLabel.setAttribute("data-field-value", this.getBoolValue(datum.value));
        var inputData = document.createElement("INPUT");
        inputData.classList.add("form-control");
        inputData.setAttribute("data-field-type", "boolean");
        inputData.setAttribute("type", "checkbox");
        inputData.setAttribute("data-field", datum.param);
        inputData.checked = datum.value;
        inputData.disabled = datum.disabled || datum.readonly;
        if (datum.readonly) {
            inputData.classList.add("readonly");
        }
        if ('onchange' in datum) {
            inputData.onchange = function() {
                datum.onchange.call(this.parent.caller, datum.param, inputData.checked);
            }.bind(this);
        }
        var inputSpan = document.createElement("SPAN");
        inputSpan.classList.add("switch-toggle");
        inputLabel.appendChild(inputData);
        inputLabel.appendChild(inputSpan);
        inputDiv.appendChild(inputLabel);
        if ('comment' in datum) {
            var commentSpan = document.createElement("SPAN");
            commentSpan.classList.add("comment");
            commentSpan.innerHTML = datum.comment;
            inputDiv.appendChild(commentSpan);
        }
        return inputDiv;
    }

    getBoolValue(boolInput) {
        return (boolInput ? 'on' : 'off');
    }

    inputNumber(datum) {
        var inputDiv = document.createElement("div");
        var inputData = null;
        if (datum.readonly) {
            inputData = document.createElement("div");
            inputData.setAttribute("data-field", datum.param);
            inputData.setAttribute("data-field-type", "number");
            inputData.innerHTML = datum.value;
        } else {
            inputData = document.createElement("INPUT");
            inputData.classList.add("form-control");
            inputData.disabled = datum.disabled;
            inputData.setAttribute("data-field", datum.param);
            inputData.setAttribute("data-field-type", "number");
            inputData.setAttribute("type", "number");
            if ('min' in datum) {
                inputData.setAttribute("min", Number(datum.min));
            }
            if ('max' in datum) {
                inputData.setAttribute("max", Number(datum.max));
            }
            if ('step' in datum) {
                inputData.setAttribute("step", Number(datum.step));
            }
            inputData.value = datum.value;
            inputData.onchange = function() {
                if (inputData.hasAttribute("min")) {
                    if (Number(inputData.value) < inputData.getAttribute("min")) {
                        inputData.value = inputData.getAttribute("min");
                    }
                }
                if (inputData.hasAttribute("max")) {
                    if (Number(inputData.value) > inputData.getAttribute("max")) {
                        inputData.value = inputData.getAttribute("max");
                    }
                }
                if (inputData.hasAttribute("step")) {
                    if (Number.isInteger(inputData.getAttribute("step"))) {
                        inputData.value = Math.round(Number(inputData.value));
                    }
                }
                if ('onchange' in datum) {
                    datum.onchange.call(this.parent.caller, datum.param, Number(inputData.value));
                }
            }.bind(this);
        }
        inputDiv.appendChild(inputData);
        if ('comment' in datum) {
            var commentSpan = document.createElement("SPAN");
            commentSpan.classList.add("comment");
            commentSpan.innerHTML = datum.comment;
            inputDiv.appendChild(commentSpan);
        }
        return inputDiv;
    }

    inputSelect(datum) {
        var inputDiv = document.createElement("div");
        var inputData = null;
        if (datum.readonly) {
            inputData = document.createElement("div");
            inputData.setAttribute("data-field", datum.param);
            inputData.setAttribute("data-field-type", "select");
            inputData.innerHTML = datum.value;
        } else {
            inputData = document.createElement("SELECT");
            inputData.classList.add("ct-select");
            inputData.classList.add("form-control");
            inputData.disabled = datum.disabled;
            inputData.setAttribute("data-field", datum.param);
            inputData.setAttribute("data-value", datum.value);
            inputData.setAttribute("data-field-type", "select");
            if ('opts' in datum) {
                datum.opts.forEach(opt => {
                    let optData = document.createElement("OPTION");
                    if (opt == datum.value) {
                        optData.selected = true;
                    }
                    optData.innerHTML = opt;
                    inputData.appendChild(optData);
                });
            }
            if ('onchange' in datum) {
                inputData.onchange = function() {
                    datum.onchange.call(this.parent.caller, datum.param, inputData.getElementsByTagName("option")[inputData.selectedIndex].text);
                }.bind(this);
            }
        }
        inputDiv.appendChild(inputData);
        if ('comment' in datum) {
            var commentSpan = document.createElement("SPAN");
            commentSpan.classList.add("comment");
            commentSpan.innerHTML = datum.comment;
            inputDiv.appendChild(commentSpan);
        }
        return inputDiv;
    }

    inputDisk(datum) {
        var checkSingle = function(inpData, datum) {
            if ("optssingle" in datum) {
                if ((datum.optssingle) && (this.checked)) {
                    let inputs = Array.from(inpData.getElementsByTagName("input"));
                    inputs.forEach(input => {
                        if ((input.checked) && (input != this)) {
                            input.checked = false;
                        }
                    });
                }
            }
        };
        var inputDiv = document.createElement("div");
        var inputData = null;
        inputData = document.createElement("UL");
        if (datum.readonly) {
            inputData.classList.add("readonly");
        }
        inputData.classList.add("list-group");
        inputData.classList.add("dialog-list-ct");
        inputData.classList.add("form-control");
        inputData.setAttribute("data-field", datum.param);
        inputData.setAttribute("data-value", datum.value);
        inputData.setAttribute("data-field-type", "disk");
        if ('opts' in datum) {
            var i = 0;
            datum.opts.forEach(opt => {
                let addOpt = true;
                if ((datum.disabled || datum.readonly) && (!datum.value.includes(opt))) {
                    addOpt = false;
                }
                if (addOpt) {
                    let optData = document.createElement("LI");
                    optData.classList.add("list-group-item");
                    let optLabel = document.createElement("LABEL");
                    optLabel.classList.add("select-space-row");
                    var optInput = document.createElement("INPUT");
                    optInput.setAttribute("type", "checkbox");
                    optInput.disabled = datum.disabled || datum.readonly;
                    optInput.onchange = function() {
                        checkSingle.call(optInput, inputData, datum);
                    }.bind(this);
                    if (datum.value.includes(opt)) {
                        optInput.checked = true;
                        checkSingle.call(optInput, inputData, datum);
                    }
                    optLabel.appendChild(optInput);
                    if ((!('labelonly' in datum)) || (!datum.labelonly)) {
                        let optSpan = document.createElement("SPAN");
                        optSpan.classList.add("select-space-name");
                        optSpan.setAttribute("option-value", opt);
                        optSpan.innerHTML = opt;
                        optLabel.appendChild(optSpan);
                    }
                    if ("optslabel" in datum) {
                        if (datum.optslabel.length > i) {
                            let optSpan2 = document.createElement("SPAN");
                            optSpan2.classList.add("select-space-details");
                            optSpan2.setAttribute("option-value", opt);
                            optSpan2.innerHTML = datum.optslabel[i];
                            optLabel.appendChild(optSpan2);
                        }
                    }
                    optData.appendChild(optLabel);
                    inputData.appendChild(optData);
                }
                i += 1;
            });
        }
        if ('onchange' in datum) {
            inputData.onchange = function() {
                let values = [];
                let lis = Array.from(inputData.childNodes);
                lis.forEach(li => {
                    if (li.childNodes[0].childNodes[0].checked) {
                        values.push(li.childNodes[0].childNodes[1].getAttribute("option-value"));
                    }
                });
                if (values.length > 1) {
                    datum.onchange.call(this.parent.caller, datum.param, values);
                } else if (values.length > 0) {
                    datum.onchange.call(this.parent.caller, datum.param, values[0]);
                } else {
                    datum.onchange.call(this.parent.caller, datum.param, "");
                }
            }.bind(this);
        }
        inputDiv.appendChild(inputData);
        if ('comment' in datum) {
            var commentSpan = document.createElement("SPAN");
            commentSpan.classList.add("comment");
            commentSpan.innerHTML = datum.comment;
            inputDiv.appendChild(commentSpan);
        }
        return inputDiv;
    }

    getFormData() {
        var inp = Array.from(this.caller.dataForm.getElementsByClassName("form-control"));
        var data = {};
        inp.forEach(inpDatum => {
            switch(inpDatum.getAttribute("data-field-type")) {
                case "boolean":
                    if (!inpDatum.classList.contains("readonly")) {
                        data[inpDatum.getAttribute("data-field")] = inpDatum.checked;
                    }
                    break;
                case "multi":
                    if (inpDatum.value) {
                        data[inpDatum.getAttribute("data-field")] = inpDatum.value.split(',').map(item=>item.trim());
                    } else {
                        data[inpDatum.getAttribute("data-field")] = [];
                    }
                    break;
                case "select":
                    data[inpDatum.getAttribute("data-field")] = inpDatum.getElementsByTagName("option")[inpDatum.selectedIndex].text;
                    break;
                case "disk":
                    if (!inpDatum.classList.contains("readonly")) {
                        let values = [];
                        let lis = Array.from(inpDatum.childNodes);
                        lis.forEach(li => {
                            if (li.childNodes[0].childNodes[0].checked) {
                                values.push(li.childNodes[0].childNodes[1].getAttribute("option-value"));
                            }
                        });
                        if (values.length > 1) {
                            data[inpDatum.getAttribute("data-field")] = values;
                        } else if (values.length > 0) {
                            data[inpDatum.getAttribute("data-field")] = values[0];
                        } else {
                            data[inpDatum.getAttribute("data-field")] = "";
                        }
                    }
                    break;
                case "object":
                    data[inpDatum.getAttribute("data-field")] = this.str2object(inpDatum.value);
                    break;
                case "ip":
                    var ipData = [];
                    var dataField = inpDatum.getAttribute("data-field");
                    ipData[0] = inpDatum.querySelector('[data-field1="'+dataField+'"][index="0"]').value;
                    ipData[1] = inpDatum.querySelector('[data-field1="'+dataField+'"][index="1"]').value;
                    ipData[2] = inpDatum.querySelector('[data-field1="'+dataField+'"][index="2"]').value;
                    ipData[3] = inpDatum.querySelector('[data-field1="'+dataField+'"][index="3"]').value;
                    var mask = inpDatum.querySelector('[data-field1="'+dataField+'"][index="4"]');
                    if (mask != null) {
                        ipData[4] = mask.value;
                    }
                    data[dataField] = this.array2ip(ipData);
                    break;
                default: // handle as text, number, password, file
                    data[inpDatum.getAttribute("data-field")] = inpDatum.value;
            }
        });
        return data;
    }

    updateFormData(data) {
        data.forEach(datum => {
            if ("param" in datum) {
                let element = document.querySelector('[data-field="'+datum.param+'"]');
                if (element) {
                    if ("value" in datum) {
                        if (element.tagName.toLowerCase() == "div") { // read only text
                            element.innerHTML = datum.value;
                        } else if (element.tagName.toLowerCase() == "select") {
                            element.setAttribute("data-value", datum.value);
                            let options = Array.from(element.getElementsByTagName("option"));
                            options.forEach(option => {
                                option.selected = (option.innerHTML == datum.value);
                            });
                        } else if (element.tagName.toLowerCase() == "ul") { // disk
                            element.setAttribute("data-value", datum.value);
                            let lis = Array.from(element.childNodes);
                            lis.forEach(li => {
                                li.childNodes[0].childNodes[0].checked = (datum.value.includes(li.childNodes[0].childNodes[1].getAttribute("option-value")));
                            });
                        } else if (element.getAttribute("data-field-type") == "multi") {
                            element.value = datum.value.join(", ");
                        } else if (element.getAttribute("data-field-type") == "boolean") {
                            element.checked = datum.value;
                        } else if (element.getAttribute("data-field-type") == "object") {
                            element.value = this.object2str(datum.value);
                        } else if (element.getAttribute("data-field-type") == "ip") {
                            let ipData = this.ip2array(datum.value);
                            let dataField = element.getAttribute("data-field");
                            element.querySelector('[data-field1="'+dataField+'"][index="0"]').value = ipData[0];
                            element.querySelector('[data-field1="'+dataField+'"][index="1"]').value = ipData[1];
                            element.querySelector('[data-field1="'+dataField+'"][index="2"]').value = ipData[2];
                            element.querySelector('[data-field1="'+dataField+'"][index="3"]').value = ipData[3];
                            var mask = element.querySelector('[data-field1="'+dataField+'"][index="4"]');
                            if (mask != null) {
                                mask.value = ipData[4];
                            }
                        } else { // input text, number, password, file
                            element.value = datum.value;
                        }
                    }
                    if ("disabled" in datum) {
                        if (element.tagName.toLowerCase() == "ul") { // disk
                            let lis = Array.from(element.childNodes);
                            lis.forEach(li => {
                                li.childNodes[0].childNodes[0].disabled = datum.disabled;
                            });
                        } else if (element.tagName.toLowerCase() != "div") { // input text, number, password, file, object
                            element.disabled = datum.disabled;
                        }
                    }
                    if ("filebase" in datum) {
                        if (element.getAttribute("data-field-type") == "file") { // file
                            element.setAttribute("data-field-base", ('filebase' in datum) ? datum.filebase : "/");
                        }
                    }
                }
            }
        });
    }
}

class settingsEditForm {
    constructor(parent, callback) {
        this.parent = parent;
        this.callback = callback;
        this.modalBody = document.createElement("div");
        this.modalBody.setAttribute("id", "dataForm");
        this.dataForm = document.createElement("FORM");
        this.editForm = new editForm(this, this.parent);
    }

    create() {
        return this.modalBody;
    }

    setData(data) {
        this.callback.call(this.parent);
        this.editForm.setFormData(data);
    }

    getData() {
        return this.editForm.getFormData();
    }

    updateData(data) {
        this.editForm.updateFormData(data);
    }
}

class modalDialog {
    constructor(caller, single = true) {
        this.caller = caller;
        if (single) {
            this.dialog = document.getElementById("modal-dialog");
            this.dispose();
        } else {
            this.dialog = document.getElementById("modal-dialog2");
            this.dispose();
        }
        this.backDrop = document.createElement("div");

        this.container = document.createElement("div");
        this.container.id = "dialog";
        this.container.style.display = "none";
        this.container.setAttribute("role", "dialog");
        this.container.setAttribute("tabindex", -1);

        var modalDia = document.createElement("div");
        modalDia.classList.add("modal-dialog");
        var modalContent = document.createElement("div");
        modalContent.classList.add("modal-content");
        modalContent.setAttribute("role", "document");

        var modalHeader = document.createElement("div");
        modalHeader.classList.add("modal-header");
        this.modalTitle = document.createElement("h4");
        this.modalTitle.classList.add("modal-title");
        modalHeader.appendChild(this.modalTitle);

        this.modalBody = document.createElement("div");
        this.modalBody.classList.add("modal-body");

        this.modalFooter = document.createElement("div");
        this.modalFooter.classList.add("modal-footer");
        var empty = document.createElement("div");
        this.modalFooter.appendChild(empty);

        modalContent.appendChild(modalHeader);
        modalContent.appendChild(this.modalBody);
        modalContent.appendChild(this.modalFooter);
        modalDia.appendChild(modalContent);
        this.container.appendChild(modalDia);
        this.dialog.appendChild(this.backDrop);
        this.dialog.appendChild(this.container);
    }

    build(title, data) {
        this.setTitle(title);
        this.setData(data);
        this.show();
    }

    setTitle(title) {
        this.modalTitle.innerHTML = title;
    }

    setData(data) {
        // This can be overridden to set data accordingly in dialog
        var dataField = document.createElement("h4");
        dataField.classList.add("panel-title");
        dataField.innerHTML = data;
        this.modalBody.appendChild(dataField);
    }

    disposeData(data) {
        while (this.modalBody.firstChild) {
            this.modalBody.firstChild.remove();
        }
    }

    show() {
        var body = document.getElementsByTagName("BODY")[0];
        body.classList.add("modal-in");
        body.classList.add("modal-open");
        this.backDrop.classList.add("modal-backdrop");
        this.backDrop.classList.add("in");
        this.container.classList.add("modal");
        this.container.classList.add("in");
        this.container.style.display = "block";
    }

    hide() {
        var body = document.getElementsByTagName("BODY")[0];
        this.container.classList.remove("modal");
        this.container.classList.remove("in");
        this.backDrop.classList.remove("modal-backdrop");
        this.backDrop.classList.remove("in");
        this.container.style.display = "none";
        body.classList.remove("modal-in");
        body.classList.remove("modal-open");
    }

    dispose() {
        while (this.dialog.firstChild) {
            this.dialog.firstChild.remove();
        }
        if (this.dialog.id != "modal-dialog2") {
            var body = document.getElementsByTagName("BODY")[0];
            body.classList.remove("modal-in");
            body.classList.remove("modal-open");
        }
    }

    addButton(text, onClick, primary, cancel, disabled) {
        var btnClick = function() {
            this.dispose();
            if (onClick != null) {
                onClick.call(this.caller);
            }
        };
        var btn = document.createElement("button");
        btn.classList.add("btn");
        this.setButtonPrimary(btn, primary);
        this.setButtonCancel(btn, cancel);
        this.setButtonDisabled(btn, disabled);

        btn.type="button";
        btn.innerHTML = text;

        btn.addEventListener("click", btnClick.bind(this) );
        btn.addEventListener("mouseup", function() { this.blur() });
        this.modalFooter.appendChild(btn);

        return btn;
    }

    setButtonPrimary(btn, cancel) {
        if (btn != null) {
            if (cancel) {
                btn.classList.remove("btn-default");
                btn.classList.add("btn-primary");
            } else {
                btn.classList.remove("btn-primary");
                btn.classList.add("btn-default");
            }
        }
    }

    setButtonCancel(btn, disabled) {
        if (btn != null) {
            if (disabled) {
                btn.classList.remove("apply");
                btn.classList.add("cancel");
            } else {
                btn.classList.remove("cancel");
                btn.classList.add("apply");
            }
        }
    }

    setButtonDisabled(btn, disabled) {
        if (btn != null) {
            if (disabled) {
                btn.classList.add("disabled");
            } else {
                btn.classList.remove("disabled");
            }
        }
    }
}

class settingsDialog extends modalDialog {
    build(title, data, cbOk = null, cbCancel = null) {
        super.build(title, data);
        var okCallback = function() {
            if (cbOk != null) {
                cbOk.call(caller);
            }
        };
        var cancelCallback = function() {
            if (cbCancel != null) {
                cbCancel.call(caller);
            }
        };
        this.addButton("Cancel", cancelCallback, false, true, false);
        this.addButton("Ok", okCallback, true, false, false);
    }

    setData(data) {
        var dataField = document.createElement("h4");
        dataField.classList.add("panel-title");
        dataField.innerHTML = JSON.stringify(data);
        this.modalBody.appendChild(dataField);
    }
}

class msgBox extends modalDialog {
    constructor(caller, title, data, cbOk = null) {
        super();
        super.build(title, data);
        var okCallback = function() {
            if (cbOk != null) {
                cbOk.call(caller);
            }
        };
        this.addButton("Ok", okCallback, true, false, false);
    }
}

class confirmDialog extends modalDialog {
    constructor(caller, title, data, cbYes = null, cbNo = null) {
        super();
        super.build(title, data);
        var noCallback = function() {
            if (cbNo != null) {
                cbNo.call(caller);
            }
        };
        var yesCallback = function() {
            if (cbYes != null) {
                cbYes.call(caller);
            }
        };
        this.addButton("No", noCallback, false, true, false);
        this.addButton("Yes", yesCallback, true, false, false);
    }
}

class editDialog extends modalDialog {
    constructor(caller, parent = null) {
        super(caller);
        this.editForm = new editForm(this, parent);
        this.cancelButton = null;
        this.editButton = null;
    }

    build(title, data, cbEdit = null, cbCancel = null, parent = null) {
        this.disposeData();
        var editCallback = function() {
            if (cbEdit != null) {
                cbEdit.call(this.caller, this.editForm.getFormData());
            }
        };
        this.dataForm = document.createElement("FORM");
        super.build(title, data);
        if (!this.cancelButton) {
            this.cancelButton = this.addButton("Cancel", cbCancel, false, true, false);
        }
        if (!this.editButton) {
            this.editButton = this.addButton("Edit", editCallback.bind(this), true, false, false);
        }
    }

    setData(data) {
        this.editForm.setFormData(data);
    }

    updateData(data) {
        this.editForm.updateFormData(data);
    }

    setEditButtonDisabled(value) {
        this.setButtonDisabled(this.editButton, value);
    }

    setCancelButtonDisabled(value) {
        this.setButtonDisabled(this.cancelButton, value);
    }
}

class fileDialog extends modalDialog {
    constructor(caller, title, cbOk = null, cbCancel = null, data) {
        if (!"path" in data) {
            data.path = "";
        }
        if (!"dir" in data) {
            data.dir = false;
        }
        if (!"save" in data) {
            data.save = false;
        }
        if (!"addNew" in data) {
            data.addNew = true;
        }
        if (!"base" in data) {
            data.base = "";
        }
        if (!"relative" in data) {
            data.relative = false;
        }
        super(caller, false);
        if (data.path) {
            data.path = this.fullPath(data, data.path);
        }
        this.loadingSpinner = new spinnerLoading();
        this.inputPath = null;
        this.selectField = null;
        this.filePath = null;
        this.currLoadedPath = "/";
        this.currSelected = "";
        super.build(title, data);
        var cancelCallback = function() {
            if (cbCancel != null) {
                cbCancel.call(caller, this.getData());
            }
        }.bind(this);
        var okCallback = function() {
            if (cbOk != null) {
                cbOk.call(caller, this.getData());
            }
        }.bind(this);
        this.addButton("Cancel", cancelCallback, false, true, false);
        var okText = "Load";
        if (data.save) {
            okText = "Save";
        } else if (data.dir) {
            okText = "Open";
        }
        this.addButton(okText, okCallback, true, false, false);
    }

    setData(data) {
        var fmForm = document.createElement("FORM");
        fmForm.classList.add("fm-form");
        var pathBar = document.createElement("div");

        pathBar.classList.add("select-space-row");
        var pathIcon = document.createElement("i");
        pathIcon.classList.add("pficon-folder-close");
        this.inputPath = document.createElement("INPUT");
        this.inputPath.classList.add("form-control");
        this.inputPath.setAttribute("type", "text");
        this.inputPath.onchange = function() {
            this.refreshContent(data, this.fullPath(data, this.inputPath.value), optCallback, true);
        }.bind(this);

        pathBar.appendChild(pathIcon);
        pathBar.appendChild(this.inputPath);

        this.selectField = document.createElement("SELECT");
        this.selectField.classList.add("fm-select");
        this.selectField.setAttribute("size", 12);
        var optCallback = function(data) {
            while (this.selectField.options.length) {
                this.selectField.remove(0);
            }
            var selectExists = false;
            data.forEach(opt => {
                let optData = document.createElement("OPTION");
                if (opt == this.currSelected) {
                    optData.selected = true;
                    selectExists = true;
                }
                optData.innerHTML = opt;
                this.selectField.appendChild(optData);
            });
            if ((!selectExists) && (this.currSelected)) {
                let optData = document.createElement("OPTION");
                optData.selected = true;
                optData.innerHTML = this.currSelected;
                this.selectField.appendChild(optData);
            }
        }.bind(this);
        this.selectField.onchange = function() {
            var value = this.selectField.getElementsByTagName("option")[this.selectField.selectedIndex].text;
            if ((value == "../") || (value == "./")) {
                this.filePath.value = "";
            } else {
                this.filePath.value = value;
            }
        }.bind(this);
        this.selectField.ondblclick = function() {
            if (this.selectField.selectedIndex >= 0) {
                let value = this.selectField.getElementsByTagName("option")[this.selectField.selectedIndex].text;
                this.refreshContent(data, this.joinPath(this.currLoadedPath, value), optCallback, ((this.isDir(value)) || (data.dir)));
            }
        }.bind(this);

        var fileBar = document.createElement("div");

        fileBar.classList.add("select-space-row");
        var fileIcon = document.createElement("i");
        fileIcon.classList.add("pficon-applications");
        this.filePath = document.createElement("INPUT");
        this.filePath.classList.add("form-control");
        this.filePath.setAttribute("type", "text");
        this.filePath.disabled = !data.addNew;
        this.filePath.onchange = function() {
            var value = this.filePath.value;
            if (value.charAt(0) == "/") {
                value = value.substring(1);
            }
            if (this.pathTrim(value).startsWith("..")) {
                value = "..";
                this.refreshContent(data, this.joinPath(this.currLoadedPath, value), optCallback, true);
            } else if (this.pathTrim(value).startsWith(".")) {
                this.filePath.value = "";
            } else {
                this.refreshContent(data, this.joinPath(this.currLoadedPath, value), optCallback);
            }
        }.bind(this);
        fileBar.appendChild(fileIcon);
        fileBar.appendChild(this.filePath);

        fmForm.appendChild(pathBar);
        fmForm.appendChild(this.selectField);
        fmForm.appendChild(fileBar);
        this.modalBody.appendChild(fmForm);
        this.refreshContent(data, data.path, optCallback);
    }

    getData() {
        return this.pathTrim(this.joinPath(this.inputPath.value, this.filePath.value));
    }

    refreshContent(data, path, callback, intoFolder = false) {
        this.currLoadedPath = this.loadedPath(data, path, !intoFolder);
        this.currSelected = this.selected(data, path);

        this.inputPath.value = this.printPath(data, this.currLoadedPath);
        this.filePath.value = this.currSelected;
        this.listDir(data, this.currLoadedPath, callback);
    }

    printPath(data, path) {
        var ppath = path;

        if (data.relative) {
            ppath = path.replace(data.base , "");
            if (ppath.charAt(0) == "/") {
                ppath = ppath.substring(1);
            }
        }

        return ppath;
    }

    fullPath(data, path) {
        var fpath = path;

        if (data.relative) {
            fpath = this.joinPath(data.base, path);
        }

        return fpath;
    }

    isDir(path) {
        return (path.slice(-1) == "/");
    }

    loadedPath(data, path, previous = true) {
        var ipath = this.pathTrim(path);
        if (previous) {
            ipath = ipath.substring(0, ipath.lastIndexOf('/'));
            if (ipath.length == 0) {
                ipath = "/";
            }
        }
        if (!this.containsBase(path, data.base)) {
            ipath = data.base;
        }
        return ipath;
    }

    selected(data, path) {
        var sel = "";
        if (path.startsWith(this.currLoadedPath)) {
            sel = path.replace(this.currLoadedPath, "");
            if (sel.charAt(0) == "/") {
                sel = sel.substring(1);
            }
            if ((sel) && (data.dir) && (!this.isDir(sel))) {
                sel += "/";
            }
        }
        return sel;
    }

    joinPath(path1, path2) {
        var path = "";
        var absPath = (path1.charAt(0) == "/");
        if (this.pathTrim(path2) == "..") {
            path = this.pathTrim(path1);
            path = path.substring(0, path.lastIndexOf('/'));
            if ((path.length == 0) && (absPath)) {
                path = "/";
            }
        } else if (this.pathTrim(path2) == ".") {
            path = this.pathTrim(path1);
            if ((path.length == 0) && (absPath)) {
                path = "/";
            }
        } else {
            if (!this.isDir(path1) && (absPath)) {
                path1 += "/";
            }
            if (path2.charAt(0) == "/") {
                path2 = path2.substring(1);
            }
            path = path1 + path2;
        }
        return path;
    }

    containsBase(path, base) {
        return this.pathTrim(path).startsWith(this.pathTrim(base));
    }

    allowPrevious(path, base) {
        return ((this.pathTrim(path) != this.pathTrim(base)) && (this.pathTrim(path).startsWith(this.pathTrim(base))));
    }

    pathTrim(path) {
        var ipath = path;
        if (this.isDir(ipath)) {
            ipath = ipath.slice(0, -1);
            if (ipath.length == 0) {
                ipath = "/";
            }
        }
        return ipath;
    }

    showSpinner(spinnerText = "") {
        if (this.modalBody) {
            this.inputPath.disabled = true;
            this.selectField.disabled = true;
            this.filePath.disabled = true;
            this.modalBody.insertBefore(this.loadingSpinner.build(spinnerText), this.modalBody.firstChild);
        }
    }

    disposeSpinner(data) {
        this.loadingSpinner.dispose();
        this.inputPath.disabled = false;
        this.selectField.disabled = false;
        this.filePath.disabled = !data.addNew;
    }

    listDir(data, path, callback) {
        var command = ["/usr/bin/ls", "-1", "--classify", "--color=never", this.pathTrim(path)];
        var cbDone = function(rData) {
            var aData = rData.split("\n");
            aData = aData.filter(n => n);
            if (data.dir) {
                aData = aData.filter(n => this.isDir(n));
            }
            if (this.allowPrevious(path, data.base)) {
                aData.unshift("../");
            } else {
                aData.unshift("./");
            }
            this.disposeSpinner(data);
            if (callback) {
                callback(aData);
            }
        };
        var cbFail = function(message, rData) {
            var aData = [];
            if (this.allowPrevious(path, data.base)) {
                aData.unshift("../");
            } else {
                aData.unshift("./");
            }
            this.disposeSpinner(data);
            if (callback) {
                callback(aData);
            }
        };
        this.showSpinner();
        return cockpit.spawn(command, { err: "out" })
        .done(cbDone.bind(this))
        .fail(cbFail.bind(this));
    }
}

class logger {
    constructor(el, logfile) {
        this.el = el;
        this.logfile = logfile;
        this.pageSize = 100;
        this.page = 1;
        this.refresh = 1000;
        this.name = "logger";
        this.pane = new tabPane(this, el, this.name);
        this.btnPrev = null;
        this.btnNext = null;
        this.timer = null;
    }

    displayContent(el) {
        this.pane.build();
        this.pane.getTable().setClickable(false);
        this.btnPrev = this.pane.addButton("Previous", "<", this.btnPreviousCallback, false, true, false);
        this.btnNext = this.pane.addButton("Next", ">", this.btnNextCallback, false, false, false);
        this.setTimer();
        return this.readLog(this.pageSize, this.page);
    }

    setPageSize(pSize) {
        this.pageSize = pSize;
    }

    setRefreshRate(refr) {
        this.refresh = refr;
    }

    setTimer() {
        var onTimer = function() {
            this.readLog(this.pageSize, this.page)
        };
        if (this.timer == null) {
            this.timer = setInterval(onTimer.bind(this), this.refresh);
        }
    }

    clearTimer() {
        if (this.timer != null) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    btnPreviousCallback() {
        this.page -= 1;
        this.readLog(this.pageSize, this.page);
    }

    btnNextCallback() {
        this.page += 1;
        this.readLog(this.pageSize, this.page);
        // If empty log (or smaller then pageSize), disable next
    }

    setPaneInfo(pane, page) {
        var now = new Date();
        pane.getTitle().innerHTML = "Log - Page: " + page.toString() + ", Updated: " + now.toLocaleString();
    }

    dataCallback(data) {
        var tabData = [];
        var lines = 0;
        this.setPaneInfo(this.pane, this.page);
        data.trim("\n").split("\n").forEach(item => {
            if (item != null) {
                lines += 1;
                if (item != "") {
                    let parts = item.split(" - ");
                    let logItem = {};
                    if (parts.length > 3) {
                        logItem.Date = parts[0].trim();
                        logItem.Level = parts[1].trim();
                        logItem.Module = parts[2].trim();
                        logItem.Event = parts.slice(3).join(" - ");
                    } else if (parts.length > 2) {
                        logItem.Date = parts[0].trim();
                        logItem.Level = parts[1].trim();
                        logItem.Module = "";
                        logItem.Event = parts[2].trim();
                    } else if (parts.length > 1) {
                        logItem.Date = parts[0].trim();
                        logItem.Level = "";
                        logItem.Module = "";
                        logItem.Event = parts[1].trim();
                    } else {
                        logItem.Date = "";
                        logItem.Level = "";
                        logItem.Module = "";
                        logItem.Event = parts[0].trim();
                    }
                    tabData.push(logItem);
                }
            }
        });

        if (this.page <= 1) {
            this.pane.setButtonDisabled(this.btnPrev, true);
            this.setTimer();
        } else {
            this.pane.setButtonDisabled(this.btnPrev, false);
            this.clearTimer();
        }

        if (lines < this.pageSize) {
            this.pane.setButtonDisabled(this.btnNext, true);
        } else {
            this.pane.setButtonDisabled(this.btnNext, false);
        }

        this.pane.getTable().setData(tabData);
    }

    readLog(lines, page) {
        // do not use cockpit.file command, but head/ tail to be able to read a partial file
        //let cmd = ["tail", "-n", (page*lines).toString(), this.logfile, "|", "head", "-n", lines.toString()];
        var cmd = ["tac", this.logfile, "|", "sed", "-n", ((page-1)*lines+1).toString()+","+(page*lines).toString()+"p"];
        var command = ["/bin/sh", "-c", cmd.join(" ")];
        var cbDone = function(data) {
            this.dataCallback(data);
        };
        var cbFail = function(message, data) {
            this.dataCallback("");
            new msgBox(this, "Error reading log", "Log error: " + (data ? data : message));
        };

        return cockpit.spawn(command, { err: "out" })
        .done(cbDone.bind(this))
        .fail(cbFail.bind(this));
    }
}
