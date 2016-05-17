@extends('layout.master')

@section('content')
<article>
	<h1>Helsingborgs stad - Style guide</h1>

    <p class="lead">Welcome to the online style guide intended for websites within Helsingborgs stad. The guide provides examples, markup and themes for our standardized components.</p>

    <h2>Getting started</h2>
    <p>
        You can easily get started by including our CSS and JavaScript from our GitHub CDN. For the advanced user who wants to customize our code, please refer to the source files in our <a href="https://github.com/helsingborg-stad/styleguide-web" class="link-item">GitHub repository</a>.
    </p>

    <h3>Using GitHub CDN</h3>
    <p>
        Copy and pase this CSS link to the <code>&lt;head&gt;</code> of your document.
    </p>
    <pre><code class="html">&lt;link rel="stylesheet" href="{{ (strpos($_SERVER['SERVER_PROTOCOL'], 'https') === true) ? 'https://' : 'http://' }}{{ $_SERVER['SERVER_NAME'] }}/dist/css/hbg-prime.css"&gt;</code></pre>

    <p>
        Include the JavaScript by copy and pasting the snippet below just before your <code>&lt;/body&gt;</code> closing tag.
    </p>
    <pre><code class="html">&lt;link rel="stylesheet" href="{{ (strpos($_SERVER['SERVER_PROTOCOL'], 'https') === true) ? 'https://' : 'http://' }}{{ $_SERVER['SERVER_NAME'] }}/dist/css/hbg-prime.css"&gt;</code></pre>
</article>
@stop
