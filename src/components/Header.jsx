import React from "react";
import styled from "styled-components";

const HeaderWrapper = styled.header`
  width: 100%;
  height: 100px;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
`;

const Logo = styled.h1`
  font-size: 36px;
  font-weight: bold;
  background: linear-gradient(180deg, #5f9dffff 40%, #ff80c0ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const SettingsButton = styled.button`
  padding: 12px 24px;
  border-radius: 6px;
  border: none;
  background: #3b82f6;
  color: white;
  cursor: pointer;
  margin-right: 50px
`;

export default function Header() {
  return (
    <HeaderWrapper>
      <Logo>TOING</Logo>
      <SettingsButton>설정</SettingsButton>
    </HeaderWrapper>
  );
}
