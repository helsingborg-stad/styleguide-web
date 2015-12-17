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
        $this->documentation = json_decode(file_get_contents('documentation.json'));

        $this->loadPage();
    }

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

    public function loadNavigation()
    {
        return $this->documentation->nav;
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
