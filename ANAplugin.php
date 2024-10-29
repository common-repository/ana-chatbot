<?php
/*
Plugin Name: Ana Chatbot
Plugin URI:  http://ana.chat
Description: Create a free chatbot for your website using Ana. You can use it to engage users on your website.
Version:     1.0
Author:      Ana
Author URI:  http://www.ana.chat
License:     GPLv3
License URI: http://www.gnu.org/licenses/gpl-3.0.html

Ana is free for personal and commercial use.
Ana is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with Ana. If not, see http://www.gnu.org/licenses/gpl-3.0.html.
 */

$test = 0;
$logoUrl = "";
$agentName = "Ana";
$logopath = "";
$projfilepath = "";
$color = "#8cc83c";
$fullpath = "";
$seconds = 0;
$response = "";
$imgName = "ana.png";
$rootpath = home_url();
add_action('admin_menu', 'anacbt_plugin_setup_menu');
register_activation_hook(__FILE__, 'anacbt_onActivate');
register_deactivation_hook(__FILE__, 'anacbt_onDeactivate');
add_action('wp_footer', 'anacbt_registerScript');

//creating the admin side-menu page

function anacbt_plugin_setup_menu()
{
    $icon = plugin_dir_url(__FILE__) . '/favicon.png';
    add_menu_page('Ana Plugin Page', 'Ana', 'manage_options', 'ANAplugin', 'anacbt_plugin_main', $icon);
    $rootpath = home_url();
}

//removing tables from and clearing of the data plugin on deactivation

function anacbt_onDeactivate()
{
    global $wpdb;
    $table_name = $wpdb->prefix . 'userdetails';
    $sql = "DROP TABLE IF EXISTS $table_name;";
    $wpdb->query($sql);
    $rootpath = home_url();
}

//removing the ana script when a new script has been updated

function anacbt_removeScript($a)
{
    $files = glob($a . '*.js');
    foreach ($files as $file) {
        if (is_file($file)) {
            unlink($file);
        }
    }
}

// registering the ana-script with the wordpress page

function anacbt_registerScript()
{
    $temp_path = wp_upload_dir();
    $uploadpath = trailingslashit($temp_path['baseurl']);
    ini_set('allow_url_fopen', '1');
    $botstatus = "";
    global $wpdb;
    $table_name = $wpdb->prefix . 'userdetails';
    $results = $wpdb->get_results("SELECT * FROM $table_name");
    if (!empty($results)) {
        foreach ($results as $row) {
            $botstatus = $row->botApply;
        }
    }
    if ($botstatus == "home page") {
        if (is_front_page()) {
            wp_register_script('ana-script', $uploadpath . 'ANA/ANAFiles/script.js', array(), false, true);
            wp_enqueue_script('ana-script');
        }

    } else {
        wp_register_script('ana-script', $uploadpath . 'ANA/ANAFiles/script.js', array(), false, true);
        wp_enqueue_script('ana-script');
    }
}

// removing all the ana project files when new file is uploaded

function anacbt_remove_files($a, $filename)
{
    $files = glob($a . '*.anaproj');
    foreach ($files as $file) {
        if (is_file($file) && $file != $filename) {
            unlink($file);
        }
    }
    $files = glob($a . '*.js');
    foreach ($files as $file) {
        if (is_file($file) && $file != $filename) {
            unlink($file);
        }
    }
}

// removing the old logo when a new one id uploaded

function anacbt_remove_images($a)
{
    $imgfiles = glob($a . '*.jpg');
    foreach ($imgfiles as $file) {
        if (is_file($file)) {
            unlink($file);
        }
    }
    $imgfiles = glob($a . '*.png');
    foreach ($imgfiles as $file) {
        if (is_file($file)) {
            unlink($file);
        }
    }
}

// Performing all the prerequisite operation on activation

function anacbt_onActivate()
{
    $temp_path = wp_upload_dir();

    $uploadpath = trailingslashit($temp_path['basedir']);
    if (!is_dir($uploadpath . "ANA")) {

        wp_mkdir_p($uploadpath . "ANA");
    }

    if (!is_dir($uploadpath . "ANA/ANAFiles/")) {
        wp_mkdir_p($uploadpath . "ANA/ANAFiles/");
    } else {
        $uploaddir = $uploadpath . "ANA/ANAFiles/";
        anacbt_remove_files($uploaddir, "sample.anaproj");
    }

    if (!is_dir($uploadpath . "ANA/ANAUploads/")) {
        wp_mkdir_p($uploadpath . "ANA/ANAUploads/");
    } else {
        $uploaddir = $uploadpath . "ANA/ANAUploads/";
        anacbt_remove_files($uploaddir, "sample.anaproj");
        anacbt_remove_images($uploaddir);

    }
    $samplelogolocation = plugins_url("/ANA/ANAUploads", __FILE__);
    $sampleflowlocation = plugins_url("/ANA/ANAUploads", __FILE__);
    if (copy($samplelogolocation . "/ana.png", $uploadpath . "ANA/ANAUploads/ana.png")) {
        $test = 1;
    } else {
        return "error";
    }

    //$remote_file_url = 'https://cdn.ana.chat/wordpress-plugin/sample_flow.anaproj';
    if (copy($sampleflowlocation . "/sample.anaproj", $uploadpath . "ANA/ANAUploads/sample.anaproj")) {
        $test = 1;
    } else {
        return "error";
    }

    $temp_path = wp_upload_dir();
    $uploadpath = trailingslashit($temp_path['baseurl']);
    $logoname = "ana.png";
    $agentName = "Ana";
    $color = "#8cc83c";
    $seconds = "3";
    $logopath = $uploadpath . 'ANA/ANAUploads/ana.png';
    $fileurl = "sample.anaproj";
    $projfilepath = $uploadpath . 'ANA/ANAUploads/sample.anaproj';
    $imgName = "ana.png";
    global $wpdb;
    $table_name = $wpdb->prefix . 'userdetails';
    $charset_collate = $wpdb->get_charset_collate();
    $sql = "CREATE TABLE $table_name (
		id mediumint(9) NOT NULL AUTO_INCREMENT,
		time datetime DEFAULT '0000-00-00 00:00:00' NOT NULL,
		businessId varchar(50) NOT NULL,
		color  varchar(50) NOT NULL,
        botApply varchar(50) NOT NULL,
        seconds mediumint(9) NOT NULL,
		logoUrl varchar(100) DEFAULT '' NOT NULL,
		fileUrl varchar(100) DEFAULT '' NOT NULL,
        modifiedLogoUrl varchar(100) DEFAULT '' NOT NULL,
        modifiedFileUrl varchar(100) DEFAULT '' NOT NULL,
        PRIMARY KEY  (id)
	) $charset_collate;";

    require_once ABSPATH . 'wp-admin/includes/upgrade.php';
    dbDelta($sql);

    $wpdb->insert(
        $table_name,
        array(
            'time' => current_time('mysql'),
            'businessId' => $agentName,
            'color' => $color,
            'botApply' => "all pages",
            'logoUrl' => $imgName,
            'seconds' => $seconds,
            'fileUrl' => $fileurl,
            'modifiedFileUrl' => $fileurl,
            'modifiedLogoUrl' => $imgName,
        )
    );
    $response = $wpdb->print_error();

    $fullpath = plugins_url("/ANA/ANAFiles/dist/assets/embed/ana-web-chat-plugin.js", __FILE__);
    $indexpath = plugins_url("/ANA/ANAFiles/dist/index.html", __FILE__);
    $seconds = 5;
    $color = "#8cc83c";
    $agentName = "Ana-bot";
    $logopath = $uploadpath . 'ANA/ANAUploads/ana.png';
    $projfilepath = $uploadpath . 'ANA/ANAUploads/sample.anaproj';
    anacbt_generateScript($fullpath, $color, $logopath, $agentName, $indexpath, $projfilepath, $seconds);
    wp_register_script('ana-script', $uploadpath . 'ANA/ANAFiles/script.js', array(), false, true);
    wp_enqueue_script('ana-script');
}

//Ana files uplaoding for the chatbot

function anacbt_fileUpload()
{
    $path = plugin_dir_path(__FILE__);

    $temp_path = wp_upload_dir();
    $uploadpath = trailingslashit($temp_path['basedir']);
    $uploadscript = trailingslashit($temp_path['baseurl']);
    global $wpdb;
    $table_name = $wpdb->prefix . 'userdetails';
    $results = $wpdb->get_row("SELECT * FROM $table_name WHERE id=1");
    $scriptpath = $uploadscript . 'ANA/ANAFiles/script.js';

    $rootpath1 = home_url();
    $rootpath = dirname(__FILE__, 2);
    $fullpath = plugins_url("ANA/ANAFiles/dist/assets/embed/ana-web-chat-plugin.js", __FILE__);
    $indexpath = plugins_url("ANA/ANAFiles/dist/index.html", __FILE__);

    if (!empty($_POST['businessId'])) {
        $agentName = sanitize_text_field($_POST['businessId']);
    } else if (!empty($results->businessId)) {
        $agentName = $results->businessId;
    } else {
        $agentName = "Ana-bot";
    }

    if (!empty($_POST['openSeconds'])) {
        $seconds = sanitize_text_field($_POST['openSeconds']);
    } else if (!empty($results->businessId)) {
        $seconds = $results->seconds;
    } else {
        $seconds = 0;
    }
    if (empty($_POST['secondsbox'])) {
        $seconds = 0;
    }

    $uploadOk = 1;
    $uploadImgOk = 1;

    if (empty($_POST['botapply'])) {
        $_POST['botapply'] = "all pages";
    }

    if (!empty($_POST['color'])) {
        $color = sanitize_hex_color($_POST['color']);
    } else {
        $color = "#8cc83c";
    }

    //for uploading the ana logo
    $imgName = "ana.png";
    $uploaddir = $uploadpath . "ANA/ANAUploads/";
    if (!empty($_FILES['logo']['name'])) {
        $imgName = sanitize_file_name($_FILES['logo']['name']);
        $imgTemp = explode('.', $imgName);
        if ((end($imgTemp) == 'jpg' || end($imgTemp) == 'png' || end($imgTemp) == 'jpeg') && ($_FILES['logo']['size'] < 4194304)) {
            $uploadfile = $uploaddir . $imgName;
            $modifiedLogoUrl = uniqid('ANAIMG_') . '.' . end($imgTemp);
            $uploadOk = 1;
            anacbt_remove_images($uploaddir);
            if (is_dir($uploaddir)) {
                //move_uploaded_file($_FILES['logo']['tmp_name'], $uploadfile);
                $copy_resp = move_uploaded_file($_FILES['logo']['tmp_name'], $uploadfile);
                if ($copy_resp) {
                    $imgName = sanitize_file_name($_FILES['logo']['name']);
                } else {
                    //  echo "hi";
                    $uploadOk = 0;
                    return "</br>Could not upload logo please try again\n Error:" . $copy_resp;
                }

            }
        } elseif (!empty($results->logoUrl)) {
            $modifiedLogoUrl = $results->modifiedLogoUrl;
            $imgName = $results->logoUrl;
            $uploadOk = 1;
        } elseif (file_exists($uploadpath . 'ANA/ANAUploads/ana.png')) {
            $uploadOk = 1;
            $imgName = "ana.png";
        } else {
            $uploadOk = 0;
            return "</br>Please upload a image of format jpg or png \n";
        }

    } elseif (!empty($results->logoUrl)) {
        $modifiedLogoUrl = $results->modifiedLogoUrl;
        $imgName = $results->logoUrl;
        $uploadOk = 1;
    } elseif (file_exists($uploadpath . 'ANA/ANAUploads/ana.png')) {
        $uploadOk = 1;
        $imgName = "ana.png";
    } else {
        $uploadOk = 0;
        return "</br>Please upload a image of format jpg or png or check the size of the file and upload again \n";
    }

    // for uploading the ana project file checking for all possible cases and validating the type of file uploaded
    $uploaddir = $uploadpath . "ANA/ANAUploads/";
    if ($uploadOk == 1) {
        $temp = explode('.', sanitize_file_name($_FILES['userfile']['name']));
        if (end($temp) == 'anaproj') {
            $uploadOk = 1;
            $filename = uniqid('ANA_') . '.' . end($temp);
            $uploadfile = $uploaddir . $filename;
            if (!empty($_FILES['userfile']['name'])) {
                anacbt_remove_files($uploaddir, $_FILES['userfile']['name']);
                $resp = move_uploaded_file($_FILES['userfile']['tmp_name'], $uploadfile);
                $logopath = $uploadscript . 'ANA/ANAUploads/' . $imgName;
                $projfilepath = $uploadscript . 'ANA/ANAUploads/' . $filename;
                $delete = $wpdb->query("TRUNCATE TABLE $table_name");
                $wpdb->insert(
                    $table_name,
                    array(
                        'time' => current_time('mysql'),
                        'businessId' => $agentName,
                        'color' => $color,
                        'botApply' => sanitize_text_field($_POST['botapply']),
                        'logoUrl' => $imgName,
                        'seconds' => $seconds,
                        'fileUrl' => sanitize_file_name($_FILES['userfile']['name']),
                        'modifiedFileUrl' => $filename,
                        'modifiedLogoUrl' => $modifiedLogoUrl,
                    )
                );
                anacbt_generateScript($fullpath, $color, $logopath, $agentName, $indexpath, $projfilepath, $seconds);
            } else {
                return "</br>Could not upload the file! \n";
            }
        } elseif (!empty($results->fileUrl)) {
            $res = $wpdb->get_row("SELECT * FROM $table_name");
            $tempFileUrl = $res->fileUrl;
            $tempModifiedFileUrl = $res->modifiedFileUrl;
            if (!$imgName) {
                $imgName = $res->logoUrl;
                $modifiedLogoUrl = $res->modifiedLogoUrl;
            }

            $delete = $wpdb->query("TRUNCATE TABLE $table_name");
            $wpdb->insert(
                $table_name,
                array(
                    'time' => current_time('mysql'),
                    'businessId' => $agentName,
                    'color' => $color,
                    'botApply' => sanitize_text_field($_POST['botapply']),
                    'logoUrl' => $imgName,
                    'seconds' => $seconds,
                    'fileUrl' => $tempFileUrl,
                    'modifiedFileUrl' => $tempModifiedFileUrl,
                    'modifiedLogoUrl' => $modifiedLogoUrl,
                )
            );
            $res = $wpdb->get_row("SELECT * FROM $table_name");
            $logopath = $uploadscript . 'ANA/ANAUploads/' . $res->logoUrl;
            $projfilepath = $uploadscript . 'ANA/ANAUploads/' . $results->modifiedFileUrl;
            anacbt_generateScript($fullpath, $color, $logopath, $agentName, $indexpath, $projfilepath, $seconds);
        } elseif (file_exists($uploadpath . 'ANA/ANAUploads/sample.anaproj')) {
            $delete = $wpdb->query("TRUNCATE TABLE $table_name");
            $tempFileUrl = "sample.anaproj";
            $modifiedFileUrl = "sample.anaproj";
            $logopath = $uploadscript . 'ANA/ANAUploads/ana.png';
            $modifiedLogoUrl = $imgName;
            $projfilepath = $uploadscript . 'ANA/ANAUploads/sample.anaproj';
            global $wpdb;
            if (!empty($_POST['botapply'])) {
                $tempvar = sanitize_text_field($_POST['botapply']);
            } else {
                $tempvar = "all pages";
            }
            $table_name = $wpdb->prefix . 'userdetails';
            $wpdb->insert(
                $table_name,
                array(
                    'time' => current_time('mysql'),
                    'businessId' => $agentName,
                    'color' => $color,
                    'botApply' => sanitize_text_field($_POST['botapply']),
                    'logoUrl' => $imgName,
                    'seconds' => $seconds,
                    'fileUrl' => $tempFileUrl,
                    'modifiedFileUrl' => $tempModifiedFileUrl,
                    'modifiedLogoUrl' => $modifiedLogoUrl,
                )
            );
            $wpdb->last_query;
            anacbt_generateScript($fullpath, $color, $logopath, $agentName, $indexpath, $projfilepath, $seconds);
        } else {
            anacbt_removeScript($scriptpath);
            return "</br>The file is not a ANA project file please try again \n";
        }
    } else {
        anacbt_removeScript($scriptpath);
        return "</br>Some of your details are not correct please verify and upload again \n";
    }
}

// Generating the ana-script

function anacbt_generateScript($fullpath, $color, $logopath, $agentName, $indexpath, $projfilepath, $seconds)
{

    $temp_path = wp_upload_dir();
    $rootpath = $temp_path['basedir'];
    $file = "script.js";
    $my_file = $rootpath . "/ANA/ANAFiles/" . $file;
    $handle = fopen($my_file, 'w') or die('Cannot open file:' . $my_file);
    $data =
        '
                    (function (){
                        var ele = document.createElement("script");
                        ele.id = "ana-web-chat-script";
                        ele.src = "' . $fullpath . '";
                        ele.setAttribute("ana-primary-bg","' . $color . '");
                        ele.setAttribute("ana-primary-fg", "white");
                        ele.setAttribute("ana-logo-url", "' . $logopath . '");
                        ele.setAttribute("ana-agent-name", "' . $agentName . '");
                        ele.setAttribute("ana-iframe-src", "' . $indexpath . '");
                        ele.setAttribute("ana-frame-height", "70vh");
                        ele.setAttribute("ana-frame-width", "360px");
                        ele.setAttribute("ana-simulator", "true");
                        ele.setAttribute("ana-html-messages", "true");
                        ele.setAttribute("ana-allow-chat-reset", "true");
                        ele.setAttribute("ana-chat-json", "' . $projfilepath . '");
                        ele.setAttribute("ana-frame-content-width", "360px");
                        ele.setAttribute("ana-gmaps-key", "");
                        ele.setAttribute("ana-auto-open","' . $seconds . '")
                        document.body.appendChild(ele);
                    })();
                    ';
    fwrite($handle, $data);
}

//This part of the code is dispalyed in the admin page of the wordpress dashboard
function anacbt_plugin_main()
{

    $temp_path = wp_upload_dir();
    $path = trailingslashit($temp_path['baseurl']);
    $output_log = "";
    if (isset($_POST['submit']) && $_POST['hidden'] == "true") {
        $output_log = anacbt_fileUpload();
    }
    global $wpdb;
    $table_name = $wpdb->prefix . 'userdetails';
    $results = $wpdb->get_row("SELECT * FROM $table_name");
    $rootpath = home_url();
    if (!empty($results)) {
        $botname = $results->businessId;
        $color = $results->color;
        $seconds = $results->seconds;
        $logoname = $results->logoUrl;
        $logopath = $path . 'ANA/ANAUploads/' . $results->logoUrl;
        $fileurl = $results->fileUrl;
        $projfilepath = $path . 'ANA/ANAUploads/' . $results->modifiedFileUrl;
    } else {
        $logoname = "ana.png";
        $botname = "Ana";
        $color = "#8cc83c";
        $seconds = "3";
        $logopath = $path . 'ANA/ANAUploads/ana.png';
        $fileurl = "sample.anaproj";
        $projfilepath = $path . 'ANA/ANAUploads/sample.anaproj';
    }

    echo '

        <style>
          .form-table td {
            margin-bottom: 9px;
            padding: 15px 10px;
            line-height: 1.3;
            vertical-align: middle;
        }

        input, select {

             font-size:15px!important;
             padding: 0px 0px!important;
        }
        p{
            line-height:1em!important;
        }

        </style>
        <script>

        function anacbt_getPreview(){
            window.open("' . home_url() . '","_blank")
        }

        function anacbt_openSecondscheckbox()
        {
            if(document.getElementById("opensecondsbox").checked)
                document.getElementById("seconds").readOnly=false;
            else
            {
                document.getElementById("seconds").readOnly=true;
                document.getElementById("seconds").value=0;
            }
        }

        function anacbt_testcolor(){
            var color = document.getElementById("colorText").value
            var isOk  = /^#[0-9A-F]{6}$/i.test(color)
            if(isOk){
                document.getElementById("colorText").value=color;
                document.getElementById("error").innerHTML=""
                document.getElementById("hidden").value=true;
                return true;
            }
            else {
               document.getElementById("error").innerHTML="Please input a valid color"
               document.getElementById("error").style.color="red"
               document.getElementById("hidden").value=false;
               return false;
            }
        }

        function anacbt_onSubmit(){
                var color = document.getElementById("colorText").value
                var isOk  = /^#[0-9A-F]{6}$/i.test(color)
                if(isOk){
                    document.getElementById("colorText").value=color;
                    document.getElementById("error").innerHTML=""
                    document.getElementById("hidden").value=true;
                    return true;
                }
                else {
                   document.getElementById("error").innerHTML="please input a valid color"
                   document.getElementById("error").style.color="red"
                   document.getElementById("hidden").value=false;
                   document.getElementById("error").style.fontWeight="bold"
                   return false;
                }

        }

            function anacbt_checkStatus()
            {
                var sec =' . $results->seconds . ';
                var temp="home page";
                if(temp=="' . $results->botApply . '")
                {

                    document.getElementById("bot").checked=true;
                }
                if(sec>0)
                {
                    document.getElementById("opensecondsbox").checked=true;
                    document.getElementById("seconds").readOnly=false;
                }
                else
                {
                    document.getElementById("seconds").value=0;
                }
            }



            function anacbt_getColorText(){
                var color = document.getElementById("color").value;
                document.getElementById("colorText").value=color;
            }
            function anacbt_getColor(){
                var color = document.getElementById("colorText").value;
                    document.getElementById("color").value=color;
            }
        </script>
        <body onload="anacbt_checkStatus()">
        <div style="width:47%;height: 100%;margin-right:10px;float:left;">
        <p style="display:flex;justify-content:center;font-size:24px;" >Ana Settings</p></br>
        <form enctype="multipart/form-data" onsubmit="return anacbt_onSubmit()" method="POST">
        <table>
        <tr>
            <td>
                <p style="font-size:14px;font-weight:600;text-align:left;vertical-align:text-top;">Upload Ana Chatbot</p>
            </td>
            <td>
                <input id="file" style="margin-left:50px; margin-top:15px;;width:200px; font-size:12px!important;" name="userfile" type="file"/>
                <a href="' . $projfilepath . '" id="file" download>' . $fileurl . '</a>
                <p style="font-size:14px;margin-left:50px;font-weight:italic;" class="description">Refer to the steps in How to Create a Chatbot</p>

            </td>
        </tr>
        <tr>
            <td>
            <br>
                <p style="font-size:14px;font-weight:600;">Upload Logo</p>
            </td>
            <td>
            <br>
                <input name="logo"; id="logo" style="margin-left:50px;width:200px;font-size:12px!important;margin-bottom:32px!important;" type="file"/>
                <span style="display:inline-block!important;margin-left:10px;"><img src="' . $logopath . '" style="display:block;padding-left:5px;" width="35px" height="35px"> <a href="' . $logopath . '" id="logo"  download>' . $logoname . '</a></span>
            </td>
        </tr>
        <tr>
            <td>
                <p style="font-size:14px;font-weight:600;">Name of Chatbot</p>
            </td>
            <td>
                <input name="businessId" maxlength="18" type="text" value="' . $botname . '" style="width:170px; margin-left:50px; padding-left:2px!important;padding-top:1px!important;padding-bottom:1px!important;"/>
            </td>
        </tr>
        <tr>
            <td>
                <p style="font-size:14px;font-weight:600;">Primary Color Hex Code</p>
            </td>
            <td>
                <input type="text" style="width:120px;margin-left:50px;padding-left:2px!important;padding-top:1px!important; padding-left:2px; padding-bottom:1px!important;" pattern="^#+([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$"  onblur="anacbt_testcolor()" onchange="anacbt_getColor()" value="' . $color . '" name="color" id="colorText"/>
                <input style="height:23px;" type="color" id="color" onchange="anacbt_getColorText()" value="' . $color . '" />
                <input type="hidden" name="hidden" id="hidden" value="true"/>
                <p id="error" style="margin-left:50px;font-size:14px;" class="description"></p>
            </td>
        </tr>
        <tr>
        <th style="padding-top:10px;font-size:14px;font-weight:600;text-align:left;vertical-align:baseline;">Add Chatbot to Home Page only</th>
        <td>
        <input type="checkbox" id="bot" style="border:1px solid #808080; margin-left:50px;"  class="regular-text code" value="home page" name="botapply"/>
        <p style="font-size:14px;margin-left:50px;font-weight:italic" class="description"> Added to all pages by default</p>
        </td>
        </tr>
        <tr>
            <td>
                <p style="font-size:14px;font-weight:600;">Enable Auto Pop-up</p>
            </td>
            <td>
                <input type="checkbox"  id="opensecondsbox" style="border:1px solid #808080; margin-bottom:2px;margin-left:50px;" value="enable" onchange="anacbt_openSecondscheckbox()" name="secondsbox"></br>
            </td>
        </tr>
        <tr>
            <td style="padding-top:10px;font-size:14px;font-weight:600;text-align:left;vertical-align:baseline;">
                Auto Pop-up Chatbot in
            </td>
            <td>
            <input readonly style="margin-left:50px;width:120px!important;padding-left:2px!important; padding-top:1px!important; padding-bottom:1px!important; height:24px;" name="openSeconds" min="0" max="1000"  id="seconds" value="' . $seconds . '" type="number"/>  seconds
            </td>
        </tr>
        </table>
        </br>
        </br>
        <p style="display:inline;" class="submit"><input style="font-size:13px!important; padding-right:10px!important; padding-left:10px!important;" type="submit" name="submit" id="submit" class="button button-primary" value="Save"/></p>
        <p style="display:inline;margin-left:10px;" class="submit"><input style="font-size:13px!important; padding-right:10px!important; padding-left:10px!important;" type="submit" onclick="anacbt_getPreview()" value="Preview" name="submit" id="submit" class="button button-primary"></p>
        </form>
        </div>
        <div style="float:right;width:51%;font-size:14px;border-left:1px solid black;">
            <p style="font-size:24px;display:flex;justify-content:center;">How to Create a Chatbot</p>
            <p style="margin-left:20px;font-size:14px;">You require Ana Studio to create chatbots. It is very easy and fun to use. Just follow these steps and you can add a chatbot to your website</p>
            <p style="margin-left:20px;font-size:18px;font-style:bold;">Setting Up</p>
            <ol style="margin-left:40px">
                <li><a href="http://ana.chat/downloads.html">Click here to download Ana Studio</a> for Windows, Linux or Mac.</li>
                <li>Run the downloaded file. The Ana setup will start and after installation, a window will open.</li>
                <li>Select Studio and then Add New Chatbot. You can give your chatbot any name you wish.</li>
            </ol>
            <p style="margin-left:20px;font-size:18px;font-style:bold;">Creating Chatbot</p>
            <p style="margin-left:20px;font-size:14px;font-style:italic;"><a href="https://cdn.ana.chat/wordpress-plugin/sample_flow.anaproj">Click here</a> to download a sample chatbot flow. You can edit this for your use.</p>
            <ol style="margin-left:40px">
                <li>Ana Chat flow designer will open, where you will create your chatbot flow.</li>
                <li> Each element of conversation is called a Node.You can add text and multimedia content to each node.</li>
                <li>You can add buttons to each node. Each button has a specific function. You can set the Button Type <br>
                for each button. Commonly used Button Types are:<br>
                NextNode- On clicking this button, it will direct it to another node<br>
                GetText - To make the user enter text, which can be stored for later use</li>
                <li>You can drag a line from a button to another node. When a user clicks on this button, he/she will be directed to the other node.</li>
            </ol>

            <p style="margin-left:20px;font-size:18px;font-style:bold;">Uploading Chatbot</p>
            <ol style="margin-left:40px">
                    <li>Double click on the node you want the conversation to start with, navigate to Node Info and check Mark as start node.</li>
                    <li>See how the chatbot will look like by clicking on Run Chat. This will show you the chatbot you have
                    created. You can make as many changes to your bot as you wish. Once the chatbot is ready, click on Save.</li>
                    <li>Click on Export and save the chatbot file. You will need to upload this file
                    in the next step.</li>
                    <li>In the WordPress Ana Plugin Configuration, in Upload Ana Chatbot section, select Choose File
                    and upload the chatbot file you had saved.</li>
                    <li>Click on Save. Click on Preview to view the bot on your website\'s homepage. All done and ready on your website!</li>
            </ol>
            <p style="margin-left:20px;font-size:14px;">You can always make new chatbots or make changes to existing one and upload them. A fun way to keep
            users on your website engaged.</p>
            <p style="margin-left:20px;font-size:14px;font-style:italic;">In case of any queries, email us at <a href="mailto:hello@ana.chat">hello@ana.chat</a>.</p>

        </div>
        </body>
        ';
    echo esc_attr($output_log);

}
