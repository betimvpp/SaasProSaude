import { Link, LinkProps, useLocation } from 'react-router-dom';

export type NavLinkProps = LinkProps & {
    disabled?: boolean;
};

export function NavLink({ disabled, ...props }: NavLinkProps) {
    const { pathname } = useLocation();

    return (
        <Link
            data-current={pathname === props.to}
            className={`flex items-center gap-1.5 text-sm font-medium ${
                disabled ? 'opacity-50 pointer-events-none' : 'text-muted-foreground hover:text-foreground'
            } data-[current=true]:text-foreground`}
            aria-disabled={disabled}
            {...props}
        />
    );
}
