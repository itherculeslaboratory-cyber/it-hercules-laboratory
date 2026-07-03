type PageHeaderProps = {
  breadcrumb: string;
  title: string;
  route: string;
};

/** QUANTUM primitive · region PageHeader */
export function PageHeader({ breadcrumb, title, route }: PageHeaderProps) {
  return (
    <header className="part-page-header" data-part="PageHeader">
      <div className="breadcrumb">{breadcrumb}</div>
      <h3>{title}</h3>
      <p className="route">{route}</p>
    </header>
  );
}
