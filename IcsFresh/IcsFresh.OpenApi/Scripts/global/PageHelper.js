
function getCoreWebResource() {
    console.log('getCoreWebResource');
    var params = {};
    params.listLanguage = [];
    listKey = [];
    $('[res]').each(function () {
        listKey.push($(this).attr('res'));
    });
    $('[res-attr]').each(function () {
        listKey.push($(this).attr('res-attr'));
    });
    $('[data-title]').each(function () {
        if ($(this).attr('data-title').lastIndexOf("'res", 0) === 0) {
            listKey.push($(this).attr('data-title').split("'").join(''));
        }
    });


    listKey = listKey.filter(function (value, index, self) {
        return self.indexOf(value) === index;
    });

    for (i in listKey) {
        params.listLanguage.push(listKey[i]);

    }

    console.log(params);

    $.ajax({
        type: "POST",
        url: GLOBAL_VARIABLE.getWepApiUrl('Language', 'Search'),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: JSON.stringify(params.listLanguage),
        async: false,
        success: function (data) {
            var List_CoreWebResource = data;
            assignCoreWebResource('[res]', List_CoreWebResource, '', '');
            assignCoreWebResourceAttr('[res-attr]', List_CoreWebResource, '', '');
            assignCoreWebResourceToDataTitle(List_CoreWebResource);
            console.log(data);
        }, //End of AJAX Success function

        failure: function (data) {
            alert(data.responseText);
        }, //End of AJAX failure function
        error: function (data) {
            alert(data.responseText);
        } //End of AJAX error function

    });
}




function assignCoreWebResource(selector, listCoreWebResource) {
    $(selector).each(function () {
        $(this).html(getResourceNameFromKey($(this).attr('res'), listCoreWebResource));
    });
}
function assignCoreWebResourceAttr(selector, listCoreWebResource) {
    $(selector).each(function () {
        $(this).attr('res-attr', getResourceNameFromKey($(this).attr('res-attr'), listCoreWebResource));
    });
}

function assignCoreWebResourceToDataTitle(listCoreWebResource) {

    // $('.simple-searchresult td[data-title]').each(function () {
    $('td[data-title]').each(function () {
        $(this).attr('data-title', "'" + getResourceNameFromKey($(this).attr('data-title').split("'").join(''), listCoreWebResource) + "'");
    });
    //$('span.ng-binding.sort-indicator').each(function () {
    //    $(this).html(getResourceNameFromKey($(this).html(), listCoreWebResource));
    //});
}

function getResourceNameFromKey(resourceName, listCoreWebResource) {
    if (!isEmpty(listCoreWebResource)) {

        var webresource = listCoreWebResource.filter(function (item) {
            return item.CoreLanguageId === resourceName;
        });
    }
    if (!isEmpty(webresource)) {
        return webresource[0].Value;
    } else {

        return resourceName;
    }
}

function showOverlay() {
    $("#overlay").modal();
}
function closeOverlay() {
    $("#overlay").modal('hide');
}

function OpenDialogError(Msg, elefocus) {
    noty({
        text: '<i class="glyph-icon icon-times-circle mrg5R"></i> ' + Msg,
        type: 'error',
        dismissQueue: true,
        theme: 'agileUI',
        layout: 'center',
        callback: {
            afterClose: function () {
                console.log('afterclose');
                if (elefocus !== undefined) {
                    scrollAndFocus(elefocus);
                }
            }
        }
    });
    closeOverlay();
}
function OpenDialogSuccess(Msg) {
    noty({
        text: '<i class="glyph-icon icon-check-circle mrg5R"></i> ' + Msg,
        type: 'success',
        dismissQueue: true,
        theme: 'agileUI',
        layout: 'center'
    });
}
function IsNull(property) {
    var result = false;
    if (property === null || property === undefined) {
        result = true;
    }
    return result;
}
function StringEmpty(property) {
    var result = false;
    if (!IsNull(property)) {
        if (property.toString().length === 0 || !property.toString().trim()) {
            result = true;
        }
    } else {
        result = true;
    }
    return result;
}


function cJsonDate(date) {
    var sjsonDate = "";
    if (this.isEmpty(date)) {
        return date;
    }

    try {
        //เพิ่มเรื่องวันที่มาเป็นตัวเลข
        if (Number.isInteger(date) === true) {
            var d = new Date(date);
            date = d;
        }
    }
    catch (err) {
        //document.getElementById("demo").innerHTML = err.message;
        date = date;
    }



    if (Object.prototype.toString.call(date) == "[object Date]") {
        sjsonDate = date.toJSON();
    } else if (date.indexOf("/Date") > -1) {
        ///Date(152211600000)/
        var d = new Date(parseInt(date.substr(6)));
        sjsonDate = d.toJSON();
    } else if (date.length == 10) {
        //28/12/2016
        arrDate = date.split('/');
        if (culture.toLowerCase() == 'th-th' && parseInt(arrDate[2]) > 2500) {
            arrDate[2] -= 543;
        }
        var sysDate = arrDate[2] + '-' + arrDate[1] + '-' + arrDate[0];
        d = (new Date(sysDate));
        sjsonDate = d.toJSON();

    }
    //2016-06-13T00:00:00
    //2018-05-09T00:00:00.000Z
    if (sjsonDate != "") {
        sjsonDate = sjsonDate.replace("07:00:00", "00:00:00");
        sjsonDate = sjsonDate.replace("00:00:00.000Z", "00:00:00.000");
        return sjsonDate;
    } else {
        return date;
    }
};

function generateButton() {
    $('[btn-type]').each(function () {
        try {
            var buttonType = $(this).attr('btn-type');
            var btnClass = '';
            var icon = '';
            var label = '';
            switch (buttonType) {
                case 'search':
                    btnClass = 'primary';
                    icon = 'icon-search';
                    label = 'Search';
                    break;

                case 'edit':
                    btnClass = 'primary';
                    icon = 'icon-pencil';
                    label = 'Edit';
                    break;
                case 'add':
                    btnClass = 'primary';
                    icon = 'icon-plus';
                    label = 'Add';
                    break;
                case 'save':
                    btnClass = 'primary';
                    icon = 'icon-save';
                    label = 'Save';
                    break;
                case 'saveAndAdd':
                    btnClass = 'primary';
                    icon = 'icon-save';
                    label = 'SaveAndAdd';
                    break;
                case 'cancel':
                    btnClass = 'danger';
                    icon = 'icon-remove';
                    label = 'Cancel';
                    break;
                case 'remove':
                    btnClass = 'danger';
                    icon = 'icon-trash';
                    label = 'Delete';
                    break;
                case 'browse':
                    btnClass = 'primary';
                    icon = 'icon-folder-open';
                    label = 'Browse';
                    break;
                case 'upload':
                    btnClass = 'primary';
                    icon = 'icon-upload';
                    label = 'Upload';
                    break;
                case 'download':
                    btnClass = 'primary';
                    icon = 'icon-download';
                    label = 'Download';
                    break;
                case 'info':
                    btnClass = 'info';
                    icon = '';
                    label = '';
                    break;
                default:

            }
            $(this).addClass('btn');
            $(this).addClass('btn-' + btnClass);
            if ($(this).is('[nolabel]')) {
                label = '';
            } else {
                label = '&nbsp;<span res="' + label + '"></span>';
            }
            $(this).html('<i class="glyph-icon ' + icon + '"></i>' + label);
        } catch (ex) {
            console.log('ERROR:generateButton');
            console.log(ex);
            console.log($(this));
        }
    });



}


function generateSimpleForm() {
    $('input').each(function () {
        if ($(this).attr('type') == undefined) {
            $(this).attr('type', 'text');
        }
    });
    $('.simple-form').each(function (el) {
        try {
            $(this).addClass('row');
            var $input = $(this).find('>input,>select,>.simple-form,>button,>textarea,>kda-datepicker');
            if ($input.prop("tagName") !== 'KDA-DATEPICKER') {
                $input.addClass('form-control');
            }
            if ($(this).attr('fixcol') != undefined) {
                colTemplate = getColtemplate($(this).attr('fixcol'));
            } else {
                colTemplate = getColtemplate($input.length);
            }
            $input.before(function () {
                if ($(this).hasClass('simple-form') || $(this).hasClass('nolabel')) {
                    return;
                }
                var res = '';
                if ($(this).attr('lblres') != undefined) {
                    res = $(this).attr('lblres');
                } else {
                    res = $(this).attr('ng-model').replace('ServerModel.', 'res');
                    res = res.replace('FillterSearch.', 'resFillterSearch.');
                }

                if ($(this).attr('lblcolwrap') != undefined) {
                    return "<label res='" + res + "' class='col-sm-" + $(this).attr('lblcolwrap') + " form-label form-group'></label>";
                } else {
                    return "<label res='" + res + "' class='" + colTemplate.label + " form-label form-group'></label>";
                }

            }).wrap(function () {
                if ($(this).attr('colwrap') != undefined) {
                    return "<div class='col-sm-" + $(this).attr('colwrap') + "'></div>";
                } else {
                    return "<div class='" + colTemplate.input + "'></div>";
                }
            });
        } catch (ex) {
            console.log('ERROR:generateSimpleForm');
            console.log(ex);
            console.log(el);
        }
    });


    $('simplerow').each(function (el) {
        try {
            $(this).wrap('<div class="row"></div>');
            //$(this).addClass('row');
            var $input = $(this).find('>input,>select,>simplerow,>button,>textarea,>kda-datepicker');
            if ($input.prop("tagName") !== 'KDA-DATEPICKER') {
                $input.addClass('form-control');
            }
            if ($(this).attr('fixcol') != undefined) {
                colTemplate = getColtemplate($(this).attr('fixcol'));
            } else {
                colTemplate = getColtemplate($input.length);
            }
            $input.before(function () {
                if ($(this).prop('tagName') === 'SIMPLEROW' || $(this).hasClass('nolabel')) {
                    return;
                }
                var res = '';
                if ($(this).attr('lblres') != undefined) {
                    res = $(this).attr('lblres')
                } else {
                    res = $(this).attr('ng-model').replace('ServerModel.', 'res');
                    res = res.replace('FillterSearch.', 'resFillterSearch.');
                }

                if ($(this).attr('lblcolwrap') != undefined) {
                    return "<label res='" + res + "' class='col-xs-" + $(this).attr('lblcolwrap') + " form-label form-group'></label>";
                } else {
                    return "<label res='" + res + "' class='" + colTemplate.label + " form-label form-group'></label>";
                }

            }).wrap(function () {
                if ($(this).attr('colwrap') != undefined) {
                    return "<div class='col-xs-" + $(this).attr('colwrap') + "'></div>";
                } else {
                    return "<div class='" + colTemplate.input + "'></div>";
                }
            });
        } catch (ex) {
            console.log('ERROR:generateSimpleForm');
            console.log(ex);
            console.log(el);
        }
    });
}
function getColtemplate(length) {
    var colTemplate = [];
    colTemplate.push({ label: 'col-xs-1', input: 'col-xs-5' });
    colTemplate.push({ label: 'col-xs-1', input: 'col-xs-5' });
    colTemplate.push({ label: 'col-xs-1', input: 'col-xs-3' });
    colTemplate.push({ label: 'col-xs-1', input: 'col-xs-2' });
    return colTemplate[length - 1];
}

function generateSubContainer() {
    $('.subcontainer').each(function (el) {
        $(this).prepend('<div><label res="' + $(this).attr('lblres') + '"></label></div>');
    });
}

function generateSimpleSearchResult() {

    $('.simple-searchresult').attr('ng-table', 'searchResultTable')
        //.attr('data-resizable-columns-id', 'searchResultTable')
        //.addClass('ng-table-resizable-columns')
        .addClass('data-tables')
        .addClass('table')
        .addClass('table-condensed')
        .addClass('table-striped')
        .addClass('fixTableHeader')
        .addClass('highlightselect');

    $('.simple-searchresult')
        .wrap('<div class="row" ng-show="ViewMode === \'LIST\'" >')
        .wrap('<div class="col-lg-12">')
        .wrap('<div class="simple-searchresult-container" ng-show="searchResult.length>0">')
        .wrap('<div id="simple-searchresult-scroll" class="simple-searchresult-scroll"></div>');


    if (!$('.simple-searchresult').hasClass('nosearchbox')) {


        $('.simple-searchresult-container').prepend('<div class="row" style="margin-bottom:6px;">'
            /*
            + '<div class="col-md-4">'
            + '   <select id="simpleSearchresultOption" ng-model="simpleSearchresultOption" onchange="getHeaderNameForHide()" >'
            + '        <option res="resMoreOption" value=""></option>'
            + '        <option res="resHideColumn" value="hideColumn"></option>'
            + '    </select>'
            + '</div>'
            */
            + '<div class="col-md-12">'
            + '    <i class="glyph-icon icon-search icon-in-textbox" ></i>'
            + '    <input ng-model="queryResult[queryBy]" placeholder="Search in table..." class="form-control width-250" />'
            + '   <select class="hidden" ng-model="queryBy" ng-init="queryBy=\'$\'">'
            + '        <option res="resSelectAll" value="$"></option>'
            + '        <option res="resFTRNNO" value="FTRNNO"></option>'
            + '    </select>'
            + '</div>'
            + '</div>'
        );
    }
    $('.simple-searchresult-container').before(
        '<br><div class="row" ng-show="searchResult.length === 0">'
        + '    <div class="col-lg-12 text-center">'
        + '        <label style="color:red" res="resDataNotFound"></label>'
        + '    </div>'
        + '</div>'
    );
}
function getHeaderNameForHide() {
    if ($('#simpleSearchresultOption').val() === 'hideColumn') {
        if ($('#divHideColumn').html() !== '') {
            return;
        }
        $('.simple-searchresult tr:first-child th').each(function (i, el) {
            var chkHide = $('<input type="checkbox" checked onclick="searchResultToggleColumn(' + (i) + ',this.checked)" />');
            span = $(el).find('span');
            var lbl = $('<label>' + $(span).html() + '&nbsp;&nbsp;&nbsp;</label>');
            $('#divHideColumn').append(chkHide);
            $('#divHideColumn').append(lbl);
        });
    }
}

function searchResultToggleColumn(i, isShow) {
    console.log(i, isShow);
    $('.simple-searchresult tr').each(function () {
        if (isShow) {
            $(this).find('th:nth(' + (i) + ')').removeClass('hide');
            $(this).find('td:nth(' + (i) + ')').removeClass('hide');
        } else {
            $(this).find('th:nth(' + (i) + ')').addClass('hide');
            $(this).find('td:nth(' + (i) + ')').addClass('hide');
        }
    });
}



this.undefinedToEmpty = function (obj) {
    if (obj == undefined || obj == null) {
        return '';
    } else {
        return obj;
    }
}
this.isEmpty = function (obj) {
    return this.undefinedToEmpty(obj) == '';
}
generateButton();
generateSubContainer();
generateSimpleSearchResult();
generateSimpleForm();
getCoreWebResource();