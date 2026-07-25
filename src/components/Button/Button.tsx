import React from "react";
import { CustomButton } from "./Button.styled";

type ButtonProps = {
  text: string;
  border: number;
  border_color: string;
  border_radius: number;
  hover_bg: string;
  bg: string;
  icon?: string;
  width: string;
  padding: string;
  disabled: boolean;
  ariaLabel: string;
  ariaCurrent?: boolean;
  ariaControls?: string;
  onClick: () => void;
  /**
   * The underlying <button>. A caller that can disable this button as a
   * result of pressing it needs the element itself, because the browser
   * unfocuses whatever it just disabled. React 19 passes `ref` through as an
   * ordinary prop, so no forwardRef wrapper is needed.
   */
  ref?: React.Ref<HTMLButtonElement>;
};

const Button: React.FC<ButtonProps> = ({
  text,
  border,
  border_color,
  border_radius,
  hover_bg,
  bg,
  icon,
  width,
  padding,
  disabled,
  ariaLabel,
  ariaCurrent,
  ariaControls,
  onClick,
  ref,
}) => {
  return (
    <CustomButton
      ref={ref}
      type="button"
      $border={border}
      $border_color={border_color}
      $border_radius={border_radius}
      $bg={bg}
      $width={width}
      onClick={onClick}
      $padding={padding}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-current={ariaCurrent ? "true" : undefined}
      aria-controls={ariaControls}
      $hover_bg={hover_bg}
    >
      {icon && <img src={icon} alt="" />}
      {text && text}
    </CustomButton>
  );
};

export default Button;
