import {
    Button,
    Menu,
    Group,
    ActionIcon,
    rem,
    useMantineTheme,
    PolymorphicComponentProps,
    ButtonProps,
} from "@mantine/core";
import { IconChevronDown } from "@tabler/icons-react";
import classes from "./styles/SplitButton.module.css";
import { ElementType, ReactNode } from "react";

export const SplitButton = ({
    buttonProps,
    dropDownItems,
    children,
}: {
    buttonProps: PolymorphicComponentProps<"button", ButtonProps>;
    dropDownItems: { text: string; icon?: ElementType; onClick: () => void }[];
    children: ReactNode;
}) => {
    const theme = useMantineTheme();

    return (
        <Group wrap="nowrap" gap={0}>
            <Button className={classes.button} fullWidth {...buttonProps}>
                {children}
            </Button>
            <Menu
                transitionProps={{ transition: "pop" }}
                position="bottom-end"
                withinPortal
            >
                <Menu.Target>
                    <ActionIcon
                        variant="filled"
                        color={theme.primaryColor}
                        size={36}
                        className={classes.menuControl}
                    >
                        <IconChevronDown
                            style={{ width: rem(16), height: rem(16) }}
                            stroke={1.5}
                        />
                    </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                    {dropDownItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Menu.Item
                                key={item.text}
                                onClick={item.onClick}
                                disabled={buttonProps.disabled}
                                leftSection={
                                    Icon ? (
                                        <Icon
                                            style={{
                                                width: rem(16),
                                                height: rem(16),
                                            }}
                                            stroke={1.5}
                                            color={theme.colors.blue[5]}
                                        />
                                    ) : undefined
                                }
                            >
                                {item.text}
                            </Menu.Item>
                        );
                    })}
                </Menu.Dropdown>
            </Menu>
        </Group>
    );
};
