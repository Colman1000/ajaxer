;
/***************************************
 * -------------------------------------
 *  -------      AJAXER    --------
 *  ------------------------------------
 *       PLUGIN FOR EASY SYSTEMS
 *      JOHN DBLAQ ** COLMAN MINO
 *-------------------------------------
 ***************************************/


/**
 *   AVAILABLE ATTRIBUTES
 *
 *   @param before
 *   @param loader
 *   @param dir
 *   @param ext
 *   @param params
 *   @param href
 *   @param target
 *   @param cache
 *   @param method
 *   @param after
 *   @param afterrender
 *   @param role
 *
 *   */

var ajaxerDir = '../content/' ,                 //Path to ajax content,
    ajaxerExt = 'php',                         //Extension of files for ajax fetch
    ajaxerDefaultTarget = '#ajaxerContainer'    //ID of container eg 'div' to hold ajax content after fetch
;

function initAjaxer() {

    $("a[data-type='ajaxer'], ajaxer").each(function () {

        //Adding custom'click' event listeners
        $(this).on('click.ajaxer', function (e) {

           //Removing all ajaxer listeners so as not to have two listeners on a link
            ajaxerUnlink();

            //Checking if beforeCall Function is defined 'using data-before'
            //NB: function MUST return boolean

            var
                showAjaxerLoader = true,
                beforeFunction,
                ajaxerParams,
                afterFunction,
                afterRenderFunction,
                link,
                href,
                target
            ;

            let dataBefore = $(this).data('before');
            if ( typeof dataBefore !== 'undefined'){
                //Testing if beforeCall function returns true

                dataBefore = dataBefore.toString();

                //adding brackets in case omitted except for boolean values
                if(dataBefore === 'true' || dataBefore === 'false'){
                    //ignoring in case of boolean values
                }
                else if( dataBefore.indexOf('(') < 0){
                    dataBefore += '()';
                }

                if ( ! eval( dataBefore ) ) {
                    initAjaxer();
                    return;
                }
            }

            //ignoring a loader if it's set by 'data-loader' = false
            if(typeof $(this).data('loader') !== 'undefined'){
                showAjaxerLoader = $(this).data('loader');
            }

            //Changing the path to file using data-dir' attribute
            ajaxerDirectory =  ( $(this).data('dir') )? $(this).data('dir'): ajaxerDir;
            ajaxerDirectory = (ajaxerDirectory[ajaxerDirectory.length - 1] !== '/')? ajaxerDirectory + '/' : ajaxerDirectory;

            //Changing the extension of file to the specified extension with data-ext' attribute
            ajaxerExtension = ($(this).data('ext'))? $(this).data('ext'): ajaxerExt;
            ajaxerExtension = (ajaxerExtension[0] === '.')? ajaxerExtension.substring(1) : ajaxerExtension;

            if ($(this).data('params')){
                eval('ajaxerParams = ' + $(this).data('params'));
            }

            //Preparing the link to file specified in the href attribute
            //NB: links MUST start with a pound sign '#' eg #aboutpage which will change to,
            //in this case, ./content/aboutpage.php

            //href is a reuired attribute... exit if not supplied
            link = $(this).attr('href');
            if(! link){
                initAjaxer();
                return;
            }

            //Removing leading '#' if attached
            href = link.substr(link.indexOf('#') + 1).toLowerCase();

            //Appending directory and extension to link
            href = ajaxerDirectory + href + '.' + ajaxerExtension;

            //Selecting default target container if target not specified using data-target
            if ($(this).data('target')){
                target = $(this).data('target');
                target = (target.indexOf('#') < 0)? '#' + target : target
            }
            else {
                target = ajaxerDefaultTarget;
            }

            if(showAjaxerLoader){
                Pace.restart();
                //showing the Loader
                $('#ajaxLoaderIndicator').fadeIn(0);
            }

            //Sending request to specified url using GET method
            $.ajax({
                url : href,
                cache : $(this).data('cache') === 'true',
                method: ($(this).data('method'))? $(this).data('method') : 'POST',
                data : ajaxerParams,
            })
                .done(
                    function (data) {

                        //Passing fetched data to a custom function if specified in 'data-after' attribute eg 'data-after' = 'customFunction'
                        if ($(this).data('after')){

                            afterFunction  = $(this).data('after');
                            afterFunction = (afterFunction.indexOf('(') > -1 )? afterFunction.substr(0,afterFunction.indexOf('(')) : afterFunction;

                            //Passing fetched data to specified function and evaluating
                            eval( afterFunction + "("+ data +")");
                            initAjaxer();

                        }
                        else {

                            //Creating element to enable JQuery to parse
                            var page = document.createElement('div');
                            $(page).html(data);

                            //Checking to see if <title> tag is available so as to effect change
                            if (!! $(page).find('title').text()) {
                                document.title = $(page).find('title').text().trim();
                            }

                            //Rendering the <mainArticle> tag in the selected target
                            if( !!$(page).find('mainArticle').html() ){
                                $(target).html( $(page).find('mainArticle').html().trim() );
                            }

                            //Rendering the <script> tag in the selected target
                            if(!! $(page).find('script').text()){
                                //Running all code within the <script> tag
                                eval($(page).find('script').text().trim());
                            }

                        }

                        if ($(this).data('afterrender')){
                            afterRenderFunction = $(this).data('afterrender');

                            //adding brackets in case omitted except for boolean values
                            if(afterRenderFunction === 'true' || afterRenderFunction === 'false'){
                                //ignoring in case of boolean values
                            }
                            else if( afterRenderFunction.indexOf('(') < 0){
                                afterRenderFunction += '()';
                            }

                            eval( afterRenderFunction );
                        }
                        //Displaying appropriate navigation markers
                        //FOR EASY X ONLY
                        if ($(this).data('role') && $(this).data('role') === 'nav') {
                            $('#sideBar').find('.active').removeClass('active');
                            $(this).parents('li').addClass('active');
                        }
                        // Binding the GET method to the 'this' keyword so it refers
                        //to the JQuery object that was clicked instead of the browser's window object
                    }.bind(this))
                .fail(
                    function (jqXHR, exception) {
                        // Our error logic here
                        var msg = '';
                        if (jqXHR.status === 0) {
                            msg = 'Not connected... Verify Network Connection.';
                        }
                        else if (jqXHR.status === 404) {
                            msg = 'Requested page not found. [404]';
                        }
                        else if (jqXHR.status === 500) {
                            msg = 'Internal Server Error [500].';
                        }
                        else if (exception === 'parsererror') {
                            msg = 'Requested JSON parse failed.';
                        }
                        else if (exception === 'timeout') {
                            msg = 'Time out error.';
                        }
                        else if (exception === 'abort') {
                            msg = 'Ajax request aborted.';
                        }
                        else {
                            msg = 'Uncaught Error.<br />' + jqXHR.responseText;
                        }

                        // language=HTML
                        $(target).html(
                            "<li id='erMsg' style='display: none ;font-size: large; margin-top: calc(100%/10); list-style: none; ' class='header text-center text-danger'>" +
                            "<span class='fa fa-warning'></span> &nbsp;" +
                            msg +
                            "</li>"
                        );

                        $('#erMsg').show();
                    })
                .always(
                    function () {

                        if (showAjaxerLoader) {
                            Pace.stop();
                        }
                        initAjaxer();
                        $('body').removeClass('pace-running')
                    })
        });
    });
}

function ajaxerUnlink(){
    //Removing all ajaxer listeners so as not to have two listeners on a link
    $("a[data-type='ajaxer'], ajaxer").unbind('click.ajaxer');
}

function ajaxerRefresh(){
    ajaxerUnlink();
    initAjaxer();
}

$(function () {
    initAjaxer();
});
