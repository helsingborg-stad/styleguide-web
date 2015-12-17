<!doctype html>
<html class="no-js" lang="sv">
<head>
    <meta charset="utf-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>Helsingborg Style Guide</title>
    <meta name="description" content="">

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
            margin-top: 9px;
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
                        <li><a href="#">Helsingborg.se</a></li>
                        <li><a href="#">Link 1</a></li>
                        <li><a href="#">Link 2</a></li>
                        <li><a href="#">Link 3</a></li>
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
    <script src="/dist/js/app.min.js"></script>
</body>
</html>
