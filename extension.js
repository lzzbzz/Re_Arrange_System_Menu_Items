const { GObject, Shell, St } = imports.gi;
const Lang = imports.lang;
const Main = imports.ui.main;
const Menu = Main.panel.statusArea.aggregateMenu.menu;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const SystemActions = imports.misc.systemActions;

let orientationLock;
let settings;
let separator1;
let logout;
let switchUser;
let power;

var _bringOut = new Lang.Class({
    Name: "Bring Out Submenu Of Power Off/Logout Button and Rearrange the Order of System Menu.",
    Extends: PanelMenu.SystemIndicator,
    
_init: function() {
        this._system = Main.panel.statusArea.aggregateMenu._system;
        this._systemActions = new SystemActions.getDefault();
        this._createSubMenu();
        Menu.box.remove_actor(this._system.menu.actor);
},

_createSubMenu: function() {

let bindFlags = GObject.BindingFlags.DEFAULT | GObject.BindingFlags.SYNC_CREATE;

orientationLock = new PopupMenu.PopupImageMenuItem( this._systemActions.getName('lock-orientation'), this._systemActions.orientation_lock_icon);
orientationLock.connect('activate', () => { this._systemActions.activateLockOrientation(); });
Menu.addMenuItem(orientationLock);
this._systemActions.bind_property('can-lock-orientation', orientationLock, 'visible', bindFlags);
this._systemActions.connect('notify::orientation-lock-icon', () => { let labelText = this._systemActions.getName("lock-orientation"); let iconName = this._systemActions.orientation_lock_icon;
            orientationLock.setIcon(iconName);
            orientationLock.label.text = labelText;  });

let settingsApp = Shell.AppSystem.get_default().lookup_app( 'gnome-control-center.desktop' );
let [name, icon] = [ settingsApp.get_name(), settingsApp.app_info.get_icon().names[0] ];

settings = new PopupMenu.PopupImageMenuItem(name, icon);
if (settingsApp) {
settings.connect('activate', () => { Main.overview.hide(); settingsApp.activate(); });
Menu.addMenuItem(settings); }
else { log('Missing required core component Settings, expect trouble…'); settings = new St.Widget(); }

separator1 = new PopupMenu.PopupSeparatorMenuItem;
Menu.addMenuItem(separator1);

logout = new PopupMenu.PopupImageMenuItem(_('Logout'), 'system-log-out-symbolic');
logout.connect('activate', () => { this._systemActions.activateLogout(); });
Menu.addMenuItem(logout);
this._systemActions.bind_property('can-logout', logout, 'visible', bindFlags);

switchUser = new PopupMenu.PopupImageMenuItem(_('Switch User'), 'system-switch-user-symbolic.svg');
switchUser.connect('activate', () => { this._systemActions.activateSwitchUser(); });
Menu.addMenuItem(switchUser);
this._systemActions.bind_property('can-switch-user', switchUser, 'visible', bindFlags);

power = new PopupMenu.PopupImageMenuItem(_('Power Off'), 'system-shutdown-symbolic');
power.connect('activate', () => { this._systemActions.activatePowerOff(); });
Menu.addMenuItem(power);
this._systemActions.bind_property('can-power-off', power, 'visible', bindFlags);

},
    
destroy: function () {
Menu.box.remove_actor(orientationLock);
Menu.box.remove_actor(settings);
Menu.box.remove_actor(separator1);
Menu.box.remove_actor(logout);
Menu.box.remove_actor(switchUser);
Menu.box.remove_actor(power);
Menu.box.add_actor(this._system.menu.actor)
}
});

function init() {}

let modifiedMenu;

function enable() {
modifiedMenu = new _bringOut();
}

function disable() {
modifiedMenu.destroy();
}
