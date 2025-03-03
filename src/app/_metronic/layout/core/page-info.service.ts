import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface PageLink {
  title: string;
  path: string | null;
  isActive: boolean;
  isSeparator?: boolean;
}

export class PageInfo {
  breadcrumbs: Array<PageLink> = [];
  title: string = '';
}

@Injectable({
  providedIn: 'root',
})
export class PageInfoService {
  public title: BehaviorSubject<string> = new BehaviorSubject<string>(
    'Dashboard'
  );
  public description: BehaviorSubject<string> = new BehaviorSubject<string>('');
  public breadcrumbs: BehaviorSubject<Array<PageLink>> = new BehaviorSubject<
    Array<PageLink>
  >([]);

  constructor() {}

  public setTitle(_title: string) {
    this.title.next(_title);
  }

  public updateTitle(_title: string) {
    setTimeout(() => {
      this.setTitle(_title);
    }, 1);
  }

  public setDescription(_title: string) {
    this.description.next(_title);
  }

  public updateDescription(_description: string) {
    setTimeout(() => {
      this.setDescription(_description);
    }, 1);
  }

  public setBreadcrumbs(_bs: Array<PageLink>) {
    this.breadcrumbs.next(_bs);
  }

  public updateBreadcrumbs(_bs: Array<PageLink>) {
    setTimeout(() => {
      this.setBreadcrumbs(_bs);
    }, 20);
  }

  public calculateTitle() {
    const asideTitle = this.calculateTitleInMenu('kt_app_sidebar');
    const headerTitle = this.calculateTitleInMenu('kt_app_header_wrapper');
    const title = asideTitle || headerTitle || '';
    this.setTitle(title);
  }

  public calculateTitleInMenu(menuId: string): string | undefined {
    const menu = document.getElementById(menuId);
    if (!menu) {
      return;
    }

    const allActiveMenuLinks = Array.from<HTMLLinkElement>(
      menu.querySelectorAll('a.menu-link')
    ).filter((link) => link.classList.contains('active'));

    if (!allActiveMenuLinks || allActiveMenuLinks.length === 0) {
      return;
    }

    const titleSpan = allActiveMenuLinks[0].querySelector(
      'span.menu-title'
    ) as HTMLSpanElement | null;
    if (!titleSpan) {
      return;
    }

    return titleSpan.innerText;
  }

  public calculateBreadcrumbs() {
    const asideBc = this.calculateBreadcrumbsInMenu('kt_app_sidebar');
    // const headerBc = this.calculateBreadcrumbsInMenu('kt_app_header_wrapper');
    const bc = asideBc && asideBc.length > 0 ? asideBc : null;

    if (!bc) {
      this.setBreadcrumbs([]);
      return;
    }
    this.setBreadcrumbs(bc);
  }

  public calculateBreadcrumbsInMenu(
    menuId: string
  ): Array<PageLink> | undefined {
    const result: Array<PageLink> = [];
    const menu = document.getElementById(menuId);
    if (!menu) {
      return;
    }

    const allActiveParents = Array.from<HTMLDivElement>(
      menu.querySelectorAll('div.menu-item')
    ).filter((link) => link.classList.contains('here'));

    if (!allActiveParents || allActiveParents.length === 0) {
      return;
    }

    allActiveParents.forEach((parent) => {
      const titleSpan = parent.querySelector(
        'span.menu-title'
      ) as HTMLSpanElement | null;
      if (!titleSpan) {
        return;
      }

      const title = titleSpan.innerText;
      const path = titleSpan.getAttribute('data-link');
      if (path) {
        return;
      }

      result.push({
        title,
        path,
        isSeparator: false,
        isActive: false,
      });
      // add separator
      result.push({
        title: '',
        path: '',
        isSeparator: true,
        isActive: false,
      });
    });

    return result;
  }

  //   public calculateBreadcrumbsInMenu(
  //     menuId: string
  //   ): Array<PageLink> | undefined {
  //     const result: Array<PageLink> = [];
  //     const menu = document.getElementById(menuId);
  // console.log(menu)
  //     if (!menu) return;

  //     // 🔹 Find the currently active link
  //     const activeLink = menu.querySelector(
  //       '.menu-link.active'
  //     ) as HTMLAnchorElement | null;
  //     console.log(activeLink)

  //     if (!activeLink) return;

  //     let currentItem: HTMLElement | null = activeLink.closest('.menu-item');
  //     console.log(currentItem)
  //     const addedPaths = new Set<string>(); // 🔹 Prevents duplicates

  //     // 🔹 Traverse upwards in the menu hierarchy
  //     while (currentItem) {
  //       const titleSpan = currentItem.querySelector(
  //         '.menu-title'
  //       ) as HTMLSpanElement | null;
  //       console.log(titleSpan)
  //       if (!titleSpan) break;

  //       const title = titleSpan.innerText.trim();
  //       const path = titleSpan.getAttribute('data-link'); // 🔹 Get path if available

  //       // 🔹 Avoid duplicates by checking Set
  //       if (addedPaths.has(path || '')) break;
  //       addedPaths.add(path || '');

  //       result.unshift({
  //         title,
  //         path: path && path !== '/' ? path : null, // ✅ Prevents navigation if path is missing
  //         isSeparator: false,
  //         isActive: false,
  //       });

  //       // 🔹 Move to the parent menu item
  //       currentItem = currentItem.closest('.menu-item.menu-accordion');
  //     }
  //     console.log(addedPaths, result)

  //     // 🔹 Add separators
  //     if (result.length > 1) {
  //       const breadcrumbWithSeparators: PageLink[] = [];
  //       result.forEach((item, index) => {
  //         breadcrumbWithSeparators.push(item);
  //         if (index < result.length - 1) {
  //           breadcrumbWithSeparators.push({
  //             title: '',
  //             path: null, // ✅ Ensures no navigation on separators
  //             isSeparator: true,
  //             isActive: false,
  //           });
  //         }
  //       });
  //       console.log(breadcrumbWithSeparators)

  //       return breadcrumbWithSeparators;
  //     }

  //   return result;
  // }
}
