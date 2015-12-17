<nav>
    <ul class="nav-aside">
        @foreach ($nav as $item => $subitems)
            <li class="{{ ($subitems) ? 'has-children' : '' }} {{ ($pageNow == $item) ? 'current' : '' }}">
                <a href="/{{ $item }}">{{ ucfirst($item) }}</a>
                @if ($pageNow == $item && $subitems)
                    <ul class="sub-menu">
                    @foreach ($subitems as $subitem)
                        <li><a href="#{{ \HbgStyleGuide\Helper\String::slug($subitem) }}">{{ ucfirst($subitem) }}</a></li>
                    @endforeach
                    </ul>
                @endif
            </li>
        @endforeach
    </ul>
</nav>
