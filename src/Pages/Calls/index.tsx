import React from "react";
import { Tabs } from "antd";
import ActiveCalls from "../../components/Calls/activeCalls";
import AllCalls from "../../components/Calls/allCalls";
import MissedCalls from "../../components/Calls/missedCalls";

export default function Calls() {
  const tabsItems = [
    {
      key: "1",
      label: `Chamadas ativas`,
      children: <ActiveCalls />,
    },
    {
      key: "2",
      label: `Histórico de chamadas`,
      children: <AllCalls />,
    },
    {
      key: "3",
      label: `Chamadas perdidas`,
      children: <MissedCalls />,
    },
  ];

  return (
    <div>
      <Tabs
        defaultActiveKey="1"
        items={tabsItems}
        tabBarStyle={{
          backgroundColor: "#FFF",
          padding: "8px 52px 0px 52px",
          color: "#000",
        }}
        style={{ zIndex: -1 }}
      />
    </div>
  );
}
