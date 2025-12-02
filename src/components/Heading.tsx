import { createElement, PropsWithChildren, ComponentPropsWithoutRef } from "react";


import "./heading.css";

export type HeadingProps = ComponentPropsWithoutRef<"h1"> & {
  as: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  size?: 'small' | 'medium' | 'large';
  variant?: 'standard' | 'Underlined' | 'caps' | 'caps-underline';
  textAlign?: 'left' | 'right' | 'center' | 'indent';
};

export function Heading({
  as,
  size = "medium",
  variant = "standard",
  textAlign = "left",
  className = "",
  children,
  ...props
}: HeadingProps) {
  
    const classes = "header"+ variant == "standard" ? " headerVariantStandard" : "" +
    variant == "Underlined" ? " headerVariantUnderlined" : "" +
    variant == "caps" ? " headerVariantCapitalized" : "" +
    variant == "caps-underline" ? " headerVariantCapsUnderlined" : "" +
    size == "large" ? " headerSizeLarge" : "" +
    size == "medium" ? " headerSizeMedium" : "" +
    size == "small" ? " headerSizeSmall" : "" +
    textAlign == "left" ? " headerTextAlignLeft" : "" +
    textAlign == "right" ? " headerTextAlignRight" : "" +
    textAlign == "center" ? " headerTextAlignCenter" : "" +
    textAlign == "indent" ? " headerTextAlignIndent" : "" +
    (className ? ` ${className}` : "");

  return createElement(as, { ...props, className: classes }, children);
}

export default Heading;