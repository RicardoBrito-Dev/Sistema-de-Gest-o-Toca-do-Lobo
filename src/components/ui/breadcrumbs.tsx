import { Text } from "./text";

export interface Breadcrumbs {
  crumb: string;
  path?: string;
  icon?: React.ReactNode;
}

export interface BreadcrumbsRootProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  breadcrumbs: Breadcrumbs[];
  divider?: React.ReactNode;
}

const BreadcrumbsRoot = ({
  breadcrumbs,
  divider = "/",
}: BreadcrumbsRootProps) => (
  <nav className="flex" aria-label="Breadcrumb">
    <ol className="flex font-medium text-secondary [&>*:last-child]:text-primary">
      {breadcrumbs.map((breadcrumb, i) => (
        <div key={breadcrumb.crumb} className="flex items-center">
          {i !== 0 && <span className="mx-1 text-primary">{divider}</span>}
          <li className="flex has-[a]:hover:text-primary has-[a]:hover:underline">
            {breadcrumb.path ? (
              <a
                className="flex cursor-pointer items-center gap-1 [&>svg]:h-3.5 [&>svg]:w-3.5"
                href={breadcrumb.path}
              >
                {breadcrumb.icon ? breadcrumb.icon : null}{" "}
                <Text className="font-semibold">{breadcrumb.crumb}</Text>
              </a>
            ) : (
              <span className="flex items-center gap-1 [&>svg]:h-3.5 [&>svg]:w-3.5">
                {breadcrumb.icon ? breadcrumb.icon : null}{" "}
                <Text>{breadcrumb.crumb}</Text>
              </span>
            )}
          </li>
        </div>
      ))}
    </ol>
  </nav>
);
BreadcrumbsRoot.displayName = "Breadcrumbs.Root";

export const Breadcrumbs = {
  Root: BreadcrumbsRoot,
};
