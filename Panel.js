MUI.Panel = new Class({
  Implements: [Events, Options],
  options: {
    id: null,
    title: 'New Panel',
    column: null,
    require: {
      css: [],
      images: [],
      js: [],
      onload: null
    },
    loadMethod: null,
    contentURL: null,
    // xhr options
    method: 'get',
    data: null,
    evalScripts: true,
    evalResponse: false,
    // html options
    content: 'Panel content',
    // Tabs
    tabsURL: null,
    tabsData: null,
    tabsOnload: function() {
    },
    header: true,
    headerToolbox: false,
    headerToolboxURL: 'pages/lipsum.html',
    headerToolboxOnload: function() {
    },
    // Style options:
    height: 125,
    addClass: '',
    scrollbars: true,
    padding: {top: 8, right: 8, bottom: 8, left: 8},
    // Other:
    collapsible: true,
    // Events
    onBeforeBuild: function() {
    },
    onContentLoaded: function() {
    },
    onResize: function() {
    },
    onCollapse: function() {
    },
    onExpand: function() {
    },
    setTitle: function(title) {
      this.titleEl.set('html',title);
    }

  },
  initialize: function(options) {
    this.setOptions(options);

    /**
     $extend(this, {
     timestamp: Date.now(),
     isCollapsed: false, // This is probably redundant since we can check for the class
     oldHeight: 0,
     partner: null
     });
     **/

    Object.append(this, {
      timestamp: Date.now,
      isCollapsed: true,
      oldWidth: 0,
      partner: null
    });


    // If panel has no ID, give it one.
    if (this.options.id == null) {
      this.options.id = 'panel' + (++MUI.Panels.panelIDCount);
    }

    // Shorten object chain
    /** 1.2 @todo */
    var instances = MUI.Panels.instances;
    var instanceID = instances.get(this.options.id);
    var options = this.options;

    // Check to see if there is already a class instance for this panel
    if (instanceID) {
      var instance = instanceID;
    }

    // Check if panel already exists
    if (this.panelEl) {
      return;
    }
    else {
      /** @todo 1.2 **/
      instances.set(this.options.id, this);


    }

    this.fireEvent('onBeforeBuild');

    if (options.loadMethod == 'iframe') {
      // Iframes have their own padding.
      options.padding = {top: 0, right: 0, bottom: 0, left: 0};
    }

    this.showHandle = true;
    if ($(options.column).getChildren().length == 0) {
      this.showHandle = false;
    }

    this.panelWrapperEl = new Element('div', {
      'id': this.options.id + '_wrapper',
      'class': 'panelWrapper expanded'
    }).inject($(options.column));

    this.panelEl = new Element('div', {
      'id': this.options.id,
      'class': 'panel expanded',
      'styles': {
        'height': options.height
      }
    }).inject(this.panelWrapperEl);

    this.panelEl.store('instance', this);

    this.panelEl.addClass(options.addClass);

    this.contentEl = new Element('div', {
      'id': options.id + '_pad',
      'class': 'pad'
    }).inject(this.panelEl);

    // This is in order to use the same variable as the windows do in updateContent.
    // May rethink this.
    this.contentWrapperEl = this.panelEl;

    this.contentEl.setStyles({
      'padding-top': options.padding.top,
      'padding-bottom': options.padding.bottom,
      'padding-left': options.padding.left,
      'padding-right': options.padding.right
    });

    this.panelHeaderEl = new Element('div', {
      'id': this.options.id + '_header',
      'class': 'panel-header',
      'styles': {
        'display': options.header ? 'block' : 'none'
      }
    }).inject(this.panelEl, 'before');

    /** 1.2 @todo */
    var columnInstances = MUI.Columns.instances;
    var columnInstance = columnInstances.get(this.options.column);

    if (columnInstance.options.sortable) {
      this.panelHeaderEl.setStyle('cursor', 'move');
      /** IEWIN8**/
      try {
        columnInstance.options.container.retrieve('sortables').addItems(this.panelWrapperEl);
      } catch (error) {
      }
    }

    if (this.options.collapsible) {
      this.collapseToggleInit();
    }

    if (this.options.headerToolbox) {
      this.panelHeaderToolboxEl = new Element('div', {
        'id': options.id + '_headerToolbox',
        'class': 'panel-header-toolbox'
      }).inject(this.panelHeaderEl);
    }

    this.panelHeaderContentEl = new Element('div', {
      'id': options.id + '_headerContent',
      'class': 'panel-headerContent'
    }).inject(this.panelHeaderEl);

    this.titleEl = new Element('h2', {'id': options.id + '_title'}).inject(this.panelHeaderContentEl);

    this.handleEl = new Element('div', {
      'id': options.id + '_handle',
      'class': 'horizontalHandle',
      'styles': {
        'display': this.showHandle == true ? 'block' : 'none'
      }
    }).inject(this.panelEl, 'after');

    this.handleIconEl = new Element('div', {
      'id': options.id + '_handle_icon',
      'class': 'handleIcon'
    }).inject(this.handleEl);

    addResizeBottom(options.id);

    if (options.require.css.length || options.require.images.length) {
      new MUI.Require({
        css: options.require.css,
        images: options.require.images,
        onload: function() {
          this.newPanel();
        }.bind(this)
      });
    }
    else {
      this.newPanel();
    }
  },
  newPanel: function() {
    var options = this.options;
    if (this.options.headerToolbox) {
      MUI.updateContent({
        'element': this.panelEl,
        'childElement': this.panelHeaderToolboxEl,
        'loadMethod': 'xhr',
        'url': options.headerToolboxURL,
        'onContentLoaded': options.headerToolboxOnload
      });
    }
    if (options.tabsURL == null) {
      this.titleEl.set('html', options.title);
    } else {
      this.panelHeaderContentEl.addClass('tabs');
      MUI.updateContent({
        'element': this.panelEl,
        'childElement': this.panelHeaderContentEl,
        'loadMethod': 'xhr',
        'url': options.tabsURL,
        'data': options.tabsData,
        'onContentLoaded': options.tabsOnload
      });
    }
    // Add content to panel.
    MUI.updateContent({
      'element': this.panelEl,
      'content': options.content,
      'method': options.method,
      'data': options.data,
      'url': options.contentURL,
      'onContentLoaded': null,
      'require': {
        js: options.require.js,
        onload: options.require.onload
      }
    });
    // Do this when creating and removing panels
    $(options.column).getChildren('.panelWrapper').each(function(panelWrapper) {
      panelWrapper.getElement('.panel').removeClass('bottomPanel');
    });
    $(options.column).getChildren('.panelWrapper').getLast().getElement('.panel').addClass('bottomPanel');
    MUI.panelHeight(options.column, this.panelEl, 'new');
  },
  collapseToggleInit: function(options) {

    var options = this.options;

    this.panelHeaderCollapseBoxEl = new Element('div', {
      'id': options.id + '_headerCollapseBox',
      'class': 'toolbox'
    }).inject(this.panelHeaderEl);

    if (options.headerToolbox) {
      this.panelHeaderCollapseBoxEl.addClass('divider');
    }

    this.collapseToggleEl = new Element('div', {
      'id': options.id + '_collapseToggle',
      'class': 'panel-collapse icon16',
      'styles': {
        'width': 16,
        'height': 16
      },
      'title': 'Collapse Panel'
    }).inject(this.panelHeaderCollapseBoxEl);

    this.collapseToggleEl.addEvent('click', function(event) {
      var panel = this.panelEl;
      var panelWrapper = this.panelWrapperEl

      // Get siblings and make sure they are not all collapsed.
      // If they are all collapsed and the current panel is collapsing
      // Then collapse the column.
      var instances = MUI.Panels.instances;
      var expandedSiblings = [];

      panelWrapper.getAllPrevious('.panelWrapper').each(function(sibling) {
        /** 1.2 @todo */
        var instance = instances.get(sibling.getElement('.panel').id);
        if (instance.isCollapsed == false) {
          expandedSiblings.push(sibling.getElement('.panel').id);
        }
      });

      panelWrapper.getAllNext('.panelWrapper').each(function(sibling) {
        /** 1.2 @todo */
        var instance = instances.get(sibling.getElement('.panel').id);
        if (instance.isCollapsed == false) {
          expandedSiblings.push(sibling.getElement('.panel').id);
        }
      });

      // Collapse Panel
      if (this.isCollapsed == false) {
        /** 1.2 @todo */
        var currentColumn = MUI.Columns.instances.get($(options.column).id);

        if (expandedSiblings.length == 0 && currentColumn.options.placement != 'main') {
          /** 1.2 @todo */
          var currentColumn = MUI.Columns.instances.get($(options.column).id);
          currentColumn.columnToggle();
          return;
        }
        else if (expandedSiblings.length == 0 && currentColumn.options.placement == 'main') {
          return;
        }
        this.oldHeight = panel.getStyle('height').toInt();
        if (this.oldHeight < 10)
          this.oldHeight = 20;
        this.contentEl.setStyle('position', 'absolute'); // This is so IE6 and IE7 will collapse the panel all the way
        panel.setStyle('height', 0);
        this.isCollapsed = true;
        panelWrapper.addClass('collapsed');
        panelWrapper.removeClass('expanded');
        MUI.panelHeight(options.column, panel, 'collapsing');
        MUI.panelHeight(); // Run this a second time for panels within panels
        this.collapseToggleEl.removeClass('panel-collapsed');
        this.collapseToggleEl.addClass('panel-expand');
        this.collapseToggleEl.setProperty('title', 'Expand Panel');
        this.fireEvent('onCollapse');
      }

      // Expand Panel
      else {
        this.contentEl.setStyle('position', null); // This is so IE6 and IE7 will collapse the panel all the way
        panel.setStyle('height', this.oldHeight);
        this.isCollapsed = false;
        panelWrapper.addClass('expanded');
        panelWrapper.removeClass('collapsed');
        MUI.panelHeight(this.options.column, panel, 'expanding');
        MUI.panelHeight(); // Run this a second time for panels within panels
        this.collapseToggleEl.removeClass('panel-expand');
        this.collapseToggleEl.addClass('panel-collapsed');
        this.collapseToggleEl.setProperty('title', 'Collapse Panel');
        this.fireEvent('onExpand');
      }
    }.bind(this));
  }
});
MUI.Panel.implement(new Options, new Events);
