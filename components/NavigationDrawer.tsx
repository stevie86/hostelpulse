import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { PropsWithChildren, useEffect, useRef, useState, useCallback } from 'react'
import styled from 'styled-components'
import { NavItems } from 'types'
import ClientOnly from './ClientOnly'
import CloseIcon from './CloseIcon'
import OriginalDrawer from './Drawer'
import { supabase } from '../lib/supabase'

type NavigationDrawerProps = PropsWithChildren<{ items: NavItems }>

export default function NavigationDrawer({ children, items }: NavigationDrawerProps) {
  return (
    <OriginalDrawer.Drawer>
      <Wrapper>
        <ClientOnly>
          <OriginalDrawer.Target openClass="drawer-opened" closedClass="drawer-closed">
            <div className="my-drawer">
              <div className="my-drawer-container">
                <DrawerCloseButton />
                <NavItemsList items={items} />
              </div>
            </div>
          </OriginalDrawer.Target>
        </ClientOnly>
      </Wrapper>
      {children}
    </OriginalDrawer.Drawer>
  )
}

function NavItemsList({ items }: NavigationDrawerProps) {
  const { close } = OriginalDrawer.useDrawer()
  const router = useRouter()
  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Check for user session on mount
  useEffect(() => {
    const checkUserSession = async () => {
      setLoadingUser(true);
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoadingUser(false);
    };

    checkUserSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setLoadingUser(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      close(); // Close the drawer after logout
      router.push('/auth/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }, [close, router]);

  useEffect(() => {
    function handleRouteChangeComplete() {
      close()
    }

    router.events.on('routeChangeComplete', handleRouteChangeComplete)
    return () => router.events.off('routeChangeComplete', handleRouteChangeComplete)
  }, [close, router])

  return (
    <ul>
      {items.map((singleItem, idx) => {
        return (
          <NavItem key={idx}>
            <NextLink href={singleItem.href}>{singleItem.title}</NextLink>
          </NavItem>
        )
      })}
      {user && (
        <NavUserSection>
          <UserEmail>Welcome, {user.email}</UserEmail>
          <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
        </NavUserSection>
      )}
    </ul>
  )
}

function DrawerCloseButton() {
  const ref = useRef(null)
  const a11yProps = OriginalDrawer.useA11yCloseButton(ref)

  return <CloseIcon className="close-icon" _ref={ref} {...a11yProps} />
}

const Wrapper = styled.div`
  .my-drawer {
    width: 100%;
    height: 100%;
    z-index: var(--z-drawer);
    background: rgb(var(--background));
    transition: margin-left 0.3s cubic-bezier(0.82, 0.085, 0.395, 0.895);
    overflow: hidden;
  }

  .my-drawer-container {
    position: relative;
    height: 100%;
    margin: auto;
    max-width: 70rem;
    padding: 0 1.2rem;
  }

  .close-icon {
    position: absolute;
    right: 2rem;
    top: 2rem;
  }

  .drawer-closed {
    margin-left: -100%;
  }

  .drawer-opened {
    margin-left: 0;
  }

  ul {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 0;
    margin: 0;
    list-style: none;

    & > *:not(:last-child) {
      margin-bottom: 3rem;
    }
  }
`

const NavItem = styled.li`
  a {
    font-size: 3rem;
    text-transform: uppercase;
    display: block;
    color: currentColor;
    text-decoration: none;
    border-radius: 0.5rem;
    padding: 0.5rem 1rem;
    text-align: center;
  }
`

const NavUserSection = styled.li`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-top: 1px solid rgb(var(--border));
  margin-top: 1rem;
  width: 100%;
`;

const UserEmail = styled.div`
  font-size: 1.8rem;
  text-align: center;
`;

const LogoutButton = styled.button`
  background: none;
  border: 1px solid currentColor;
  color: currentColor;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 1.8rem;
  text-transform: uppercase;
  transition: all 0.2s;
  
  &:hover {
    background: currentColor;
    color: rgb(var(--background));
  }
`;
