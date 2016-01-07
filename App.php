<?php

namespace HbgStyleGuide;

class App
{
    protected $default = 'home';
    protected $documentation = null;
    protected $page = null;

    public function __construct()
    {
        $this->page = isset($_GET['p']) ? $_GET['p'] : 'home';
        $this->documentation = json_decode(file_get_contents(DOCUMENTATION_SASS_PATH));

        $this->loadPage();
    }

    /**
     * Loads a page and it's navigation
     * @return bool Returns true when the page is loaded
     */
    public function loadPage()
    {
        // Navigation
        $data['nav'] = $this->loadNavigation($this->page);
        $data['pageNow'] = $this->page;

        // Home
        if ($this->page == 'home') {
            \HbgStyleGuide\View::show('home', $data);
            return true;
        }

        // Sections
        $data['docs'] = $this->loadPageDocumentation($this->page);
        \HbgStyleGuide\View::show('sections', $data);
        return true;
    }

    /**
     * Reads the navigation from the json
     * @return object Navigation
     */
    public function loadNavigation()
    {
        $nav = (array)$this->documentation->nav;
        ksort($nav);

        return (object)$nav;
    }

    /**
     * Loads the documentation of a specific page
     * @param  string $page The page
     * @return array        The documentation
     */
    public function loadPageDocumentation()
    {
        // If not set, return false
        if (!isset($this->documentation->pages->{$this->page})) {
            return false;
        }

        // If all good, return as it is
        return $this->documentation->pages->{$this->page};
    }
}
