import { Drawer } from "antd";
import { ReactNode } from "react";

export interface GenericDrawerProps {
    children: ReactNode;
    title: string;
    onClose?: () => void;
    open?: boolean;
    closeIfClickOutside?: boolean;
    showIconClose?: boolean;
    size?: "default" | "large";
    footer?: ReactNode;
    extra?: ReactNode;
    footerStyle?: React.CSSProperties;
    bodyStyle?: React.CSSProperties;
}

export default function GenericDrawer({
  children,
  title,
  onClose,
  open = false,
  showIconClose = false,
  closeIfClickOutside = true,
  size = "large",
  footer,
  extra,
  footerStyle,
  bodyStyle,
}: GenericDrawerProps) {
  return (
    <Drawer
      title={title}
      placement="right"
      closable={showIconClose}
      destroyOnClose={true}
      maskClosable={closeIfClickOutside}
      onClose={onClose}
      open={open}
      size={size}
      footer={footer}
      extra={extra}
      footerStyle={footerStyle}
      bodyStyle={bodyStyle}
    >
      {children}
    </Drawer>
  );
}
