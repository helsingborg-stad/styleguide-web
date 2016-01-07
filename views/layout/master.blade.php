<!doctype html>
<html class="no-js" lang="sv">
<head>
    <meta charset="utf-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>Helsingborg Style Guide</title>
    <meta name="description" content="">

    <link rel="stylesheet" type="text/css" href="https://highlightjs.org/static/demo/styles/github-gist.css">
    <link rel="stylesheet" type="text/css" href="/dist/css/hbg-prime.dev.css">

    <!--[if lt IE 9]>
    <script type="text/javascript">
        document.createElement('header');
        document.createElement('nav');
        document.createElement('section');
        document.createElement('article');
        document.createElement('aside');
        document.createElement('footer');
        document.createElement('hgroup');
    </script>
    <script src="https://oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js"></script>
    <![endif]-->

    <style>
        .navbar {
            margin-bottom: 40px;
        }

        #logotype {
            margin-top: 11px;
        }

        .markup-preview > .stripe {
            display: inline-block;
            height: 400px;
        }

        .states ul li + li {
            margin-top: 5px;
        }

    </style>

    <noscript>
        <style>
            .visible-noscript {display: block !important;}
        </style>
    </noscript>
</head>
<body>
    <nav class="navbar">
        <div class="container">
            <div class="grid">
                <div class="grid-md-3">
                    <img id="logotype" src="http://www.helsingborg.se/wp-content/themes/This-is-Helsingborg/assets/images/helsingborg-neg.svg" alt="Helsingborg Stad" height="35">
                </div>
                <div class="grid-md-9">
                    <ul class="nav nav-horizontal text-right">
                        <li><a href="http://www.helsingborg.se">Visit Helsingborg.se</a></li>
                    </ul>
                </div>
            </div>
        </div>
    </nav>

    <div class="container">
        <div class="grid">
            <div class="grid-md-3">
                @include('layout.navigation')
            </div>
            <div class="grid-md-9">
                @yield('content')
            </div>
        </div>
    </div>

    <footer class="main-footer">
        <div class="container">
            <div class="grid">
                <div class="grid-lg-12">
                    <a href="/" class="logotype"><img src="http://www.helsingborg.se/wp-content/themes/This-is-Helsingborg/assets/images/helsingborg-neg.svg" alt="Helsingborg Stad" width="239" height="68"></a>
                </div>
            </div>
            <div class="grid">
                <div class="grid-lg-6">
                    <ul>
                        <li><strong>Telefonnummer</strong></li>
                        <li>Helsingborg kontaktcenter: 042-10 50 00</li>
                    </ul>
                    <ul>
                        <li><strong>E-post</strong></li>
                        <li><a href="mailto:kontaktcenter@helsingborg.se" class="link-item link-item-light">kontaktcenter@helsingborg.se</a></li>
                    </ul>
                </div>
                <div class="grid-lg-6">
                    <ul>
                        <li><strong>Postadress</strong></li>
                        <li>Namn på verksamheten<br>251 89 Helsingborg</li>
                    </ul>
                </div>
            </div>
        </div>
    </footer>

    <script src="https://code.jquery.com/jquery-2.1.4.min.js"></script>
    <script src="//cdnjs.cloudflare.com/ajax/libs/highlight.js/9.0.0/highlight.min.js"></script>
    <!--<script src="/dist/js/app.min.js"></script>-->

    <script>
        $(function(){
            $('pre code').each(function(){
                var lines = $(this).text().split('\n').length - 1;
                var $numbering = $('<ul/>').addClass('line-numbers');
                $(this)
                    .addClass('has-numbering')
                    .parent()
                    .prepend($numbering);
                for (i = 1; i <= lines + 1; i++){
                    $numbering.append($('<li/>').text(i));
                }
            });
            hljs.initHighlightingOnLoad();
        });
    </script>
</body>
</html>
