'use client';

import { Fragment, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Dialog, Transition } from '@headlessui/react';
import {
  HomeIcon,
  LightBulbIcon,
  BriefcaseIcon,
  UserIcon,
  PhotoIcon,
  SparklesIcon,
  UsersIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

interface NavItem {
  name: string;
  href: string;
  icon: any;
  current?: boolean;
  children?: {
    name: string;
    href: string;
  }[];
}

const navigation: NavItem[] = [
  { 
    name: 'Command Center', 
    href: '/command-center', 
    icon: HomeIcon 
  },
  { 
    name: 'Insights Engine', 
    href: '/posts', 
    icon: LightBulbIcon,
    children: [
      { name: 'All Insights', href: '/posts' },
      { name: 'New Insight', href: '/posts/new' },
    ]
  },
  { 
    name: 'Portfolio & Case Studies', 
    href: '/case-studies', 
    icon: BriefcaseIcon,
    children: [
      { name: 'All Cases', href: '/case-studies' },
      { name: 'New Case Study', href: '/case-studies/new' },
    ]
  },
  { 
    name: 'Profile & Presence', 
    href: '/profile', 
    icon: UserIcon,
    children: [
      { name: 'Site Logo', href: '/profile/logo' },
      { name: 'Hero & Bio', href: '/cms/hero-titles' },
      { name: 'Experience', href: '/cms/experiences' },
      { name: 'Credentials', href: '/profile/credentials' },
    ]
  },
  { 
    name: 'Library', 
    href: '/media', 
    icon: PhotoIcon 
  },
  { 
    name: 'AI Assistant', 
    href: '/ai', 
    icon: SparklesIcon,
    children: [
      { name: 'Content Generation', href: '/ai' },
      { name: 'Templates', href: '/ai/templates' },
      { name: 'Configuration', href: '/ai/config' },
    ]
  },
  { 
    name: 'Leads & Collaborations', 
    href: '/leads', 
    icon: UsersIcon 
  },
  { 
    name: 'Performance & Reach', 
    href: '/analytics', 
    icon: ChartBarIcon 
  },
  { 
    name: 'Settings', 
    href: '/settings', 
    icon: Cog6ToothIcon,
    children: [
      { name: 'Social Embeds', href: '/social' },
      { name: 'Hero Media', href: '/cms/hero-media' },
    ]
  },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>(['Insights Engine', 'AI Assistant']);
  const pathname = usePathname();

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  const isActive = (href: string) => {
    if (href === '/command-center') {
      return pathname === '/command-center' || pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const renderNavItem = (item: NavItem) => {
    const active = isActive(item.href);
    const expanded = expandedItems.includes(item.name);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <li key={item.name}>
        <div>
          {hasChildren ? (
            <button
              onClick={() => toggleExpanded(item.name)}
              className={classNames(
                active
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800',
                'group flex w-full items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
              )}
            >
              <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
              <span className="flex-1 text-left">{item.name}</span>
              <ChevronRightIcon
                className={classNames(
                  expanded ? 'rotate-90 text-gray-300' : 'text-gray-400',
                  'ml-auto h-5 w-5 shrink-0 transition-transform'
                )}
                aria-hidden="true"
              />
            </button>
          ) : (
            <Link
              href={item.href}
              className={classNames(
                active
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800',
                'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
              )}
            >
              <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
              {item.name}
            </Link>
          )}
        </div>

        {/* Children submenu */}
        {hasChildren && expanded && (
          <ul className="mt-1 px-2">
            {item.children?.map((child) => (
              <li key={child.name}>
                <Link
                  href={child.href}
                  className={classNames(
                    pathname === child.href
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800',
                    'group flex gap-x-3 rounded-md py-2 pl-9 pr-2 text-sm leading-6'
                  )}
                >
                  {child.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <>
      {/* Mobile sidebar */}
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button type="button" className="-m-2.5 p-2.5" onClick={() => setSidebarOpen(false)}>
                      <span className="sr-only">Close sidebar</span>
                      <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    </button>
                  </div>
                </Transition.Child>
                
                {/* Mobile sidebar content */}
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 pb-2 ring-1 ring-white/10">
                  <div className="flex h-16 shrink-0 items-center">
                    <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
                  </div>
                  <nav className="flex flex-1 flex-col">
                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                      <li>
                        <ul role="list" className="-mx-2 space-y-1">
                          {navigation.map((item) => renderNavItem(item))}
                        </ul>
                      </li>
                    </ul>
                  </nav>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6">
          <div className="flex h-16 shrink-0 items-center">
            <h1 className="text-xl font-bold text-white">Strategic Dashboard</h1>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => renderNavItem(item))}
                </ul>
              </li>
              <li className="-mx-6 mt-auto">
                <div className="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-white hover:bg-gray-800">
                  <span className="text-gray-400">Khaledaun.com</span>
                </div>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-gray-900 px-4 py-4 shadow-sm sm:px-6 lg:hidden">
        <button
          type="button"
          className="-m-2.5 p-2.5 text-gray-400 lg:hidden"
          onClick={() => setSidebarOpen(true)}
        >
          <span className="sr-only">Open sidebar</span>
          <Bars3Icon className="h-6 w-6" aria-hidden="true" />
        </button>
        <div className="flex-1 text-sm font-semibold leading-6 text-white">Dashboard</div>
      </div>
    </>
  );
}

