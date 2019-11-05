function onHamBurgerClick() {
    if (window.matchMedia('(max-width:550px)').matches) {
        let mobileOverlay = document.querySelector('.mobile-overlay');
        let mobileSideBar = document.querySelector('ej-sidebar');
        if (mobileSideBar.classList.contains('ej-toc-mobile-slide-left')) {
            mobileSideBar.classList.remove('ej-toc-mobile-slide-left');
            mobileOverlay.classList.add('e-hidden');
        } else {
            mobileSideBar.classList.add('ej-toc-mobile-slide-left');
            mobileOverlay.classList.remove('e-hidden');
        }
    } else {
        let desktopSidebar = document.querySelector('.ej-main-parent-content');
        let classFn = desktopSidebar.classList.contains('ej-toc-slide-left') ? 'remove' : 'add';
        desktopSidebar.classList[classFn]('ej-toc-slide-left');
    }
}

function platformSwitcher(platform) {
    let path = location.pathname.replace(getBasePath() + reportViewerPath, "");
    let routerPath = getRouterPath(getSampleData().platform, platform, path);
    window.open(location.origin + getSampleData().otherPlatforms[platform] + routerPath, '_self');
}

function getRouterPath(curPlatform, targetplatform, path) {
    curPlatform = curPlatform.toLowerCase();
    targetplatform = targetplatform.toLowerCase();
    let samePath = (curPlatform.indexOf('asp') === -1 && targetplatform.indexOf('asp') === -1) ||
        (curPlatform.indexOf('asp') >= 0 && targetplatform.indexOf('asp') >= 0);
    if (samePath) {
        return path;
    } else {
        if (curPlatform.indexOf('asp') !== -1) {
            return path.split(/(?=[A-Z])/).map(function (name) {
                return name.toLowerCase()
            }).join("-");

        } else {
            return path.split(/-/).map(function (name) {
                return name.charAt(0).toUpperCase() + name.slice(1);
            }).join("");

        }
    }
}

function onMobileOverlayClick() {
    onHamBurgerClick();
}