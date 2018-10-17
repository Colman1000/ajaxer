;
/***************************************
 * -------------------------------------
 *  -------    AJAXER FOR DUO    -------
 *  ------------------------------------
 *       PLUGIN FOR EASY SYSTEMS
 *      JOHN DBLAQ ** COLMAN MINO
 *-------------------------------------
 ***************************************/


const ajaxerDir = '../content/';                     //Path to ajax content
const ajaxerExt = 'php';                              //extension of files for ajax fetch
const ajaxerDefaultTarget = 'ajaxerContainer';    // id of container eg 'div' to hold ajax content after fetch

function initAjaxer() {

    /*
    Grabbing all anchor tags that have data-* 'Type' attribute of 'ajaxer'
    Looping through all of them and adding named event listeners
    */
    $("a[data-type='ajaxer'], ajaxer").each(function () {

        //Adding custom'click' event listeners
        $(this).on('click.ajaxer', function (e) {

            //Removing all ajaxer listeners so as not to have two listeners on a link
            ajaxerRefresh();

            //Checking if beforeCall Function is defined 'using data-before'
            //NB: function MUST return boolean
            if ($(this).attr('data-before')){

                //Testing if beforeCall function returns true
                if (!(eval($(this).attr('data-before')))) {
                    initAjaxer();
                    return;
                }
            }

            //Changing the path to file using data-dir' attribute
            ajaxerDirectory =  ($(this).attr('data-dir'))? $(this).attr('data-dir'): ajaxerDir;

            //Changing the extension of file to the specified extension with data-ext' attribute
            ajaxerExtension = ($(this).attr('data-ext'))? $(this).attr('data-ext'): ajaxerExt;


            var ajaxerParam = '';

            if ($(this).attr('data-params')){
                eval('ajaxerParams = ' + $(this).attr('data-params'));
                ajaxerParam = '#auth=eaZy';
                $.each(ajaxerParams, function (key,value) {
                    ajaxerParam += '%' + key + '=' + value
                });
            }

            //Preparing the link to file specified in the href attribute
            //NB: links MUST start with a pound sign '#' eg #aboutpage which will change to,
            //in this case, ./content/aboutpage.php
            var link = $(this).attr('href');
            var href = link.substr(link.indexOf('#') + 1).toLowerCase();
            href = ajaxerDirectory + href + '.' + ajaxerExtension + ajaxerParam;

            //Selecting default target container if target not specified using data-target
            if ($(this).attr('data-target')){
                var target = $(this).attr('data-target');
                target = ((target.search('#')) >= 0) ? target.substr(target.indexOf('#') + 1) : target;
            } else {
                target = ajaxerDefaultTarget;
            }

            //targeting the DOM with id
            target = document.getElementById(target);

            //setting the ajaxerRequestRunning flag to stop others
            //from running until its completed
            window.ajaxerRequestRunning = true;

            var showAjaxLoader = (!($(this).attr('data-loader') && $(this).attr('data-loader') === 'false'));
            //displaying a loader if it's set by 'data-loader' = true

            if(showAjaxLoader){
                Pace.restart();
                $('#ajaxLoaderIndicator').fadeIn(0)
            }

            //Sending request to specified url using GET method
            $.ajax({
                url : href,
                cache : ($(this).attr('data-cache')  && $(this).attr('data-cache') === 'true'),
                method: 'POST'
            })
                .done(
                    function (data) {

                    //Passing fetched data to a custom function if specified in 'data-after' attribute eg 'data-after' = 'customFunction'
                    if ($(this).attr('data-after')){

                        //Passing fetched data to specified function and evaluating
                        eval($(this).attr('data-after') + "('"+ data +"')");

                    } else {

                        //Creating element to enable JQuery to parse
                        var page = document.createElement('div');
                        page.innerHTML = data;

                        //Checking to see if <title> tag is available so as to effect change
                        if ($(page).find('title').text() !== '' && $(page).find('title').text() !== undefined) {
                            document.title = $(page).find('title').text().trim();
                        }

                        //Rendering the <mainArticle> tag in the selected target
                        if($(page).find('mainArticle')){
                            target.innerHTML = $(page).find('mainArticle').html().trim();
                        }

                        //Rendering the <script> tag in the selected target
                        if($(page).find('script')){
                            //Running all code within the <script> tag
                            eval($(page).find('script').text().trim());
                        }


                    }

                    if ($(this).attr('data-afterRender')){

                        eval($(this).attr('data-afterRender'));
                    }

                    //Displaying appropriate navigation markers
                    if ($(this).attr('data-role') !== undefined && $(this).attr('data-role') === 'nav') {
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
                    } else if (jqXHR.status == 404) {
                        msg = 'Requested page not found. [404]';
                    } else if (jqXHR.status == 500) {
                        msg = 'Internal Server Error [500].';
                    } else if (exception === 'parsererror') {
                        msg = 'Requested JSON parse failed.';
                    } else if (exception === 'timeout') {
                        msg = 'Time out error.';
                    } else if (exception === 'abort') {
                        msg = 'Ajax request aborted.';
                    } else {
                        msg = 'Uncaught Error.<br />' + jqXHR.responseText;
                    }

                    // language=HTML
                    target.innerHTML =
                        "<li id='erMsg' style='display: none ;font-size: large; margin-top: calc(100%/10); list-style: none; ' class='header text-center text-danger'>" +
                            "<span class='fa fa-warning'></span> &nbsp;" +
                            msg +
                        "</li>";

                    $('#erMsg').show();
                })
                .always(
                    function () {

                        //clearing the ajaxerRequestRunning flag
                        window.ajaxerRequestRunning = false;
                        //stoping Pace loader if 'twas set by 'data-loader' = true
                        Pace.stop();
                        // $('#ajaxLoaderIndicator').slideUp(0)
                        initAjaxer();
                        $('body').removeClass('pace-running')
                    }
            )
        });
    });
}

function ajaxerRefresh(){
    //Removing all ajaxer listeners so as not to have two listeners on a link
    $("a[data-type='ajaxer'], ajaxer").unbind('click.ajaxer');

}

$(function () {
    initAjaxer();
});
