import React from "react"
import { render } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import {
  mockIsBrowser,
  createMockStorageManager,
  defaultThemeOptions,
  getColorModeButton,
  DummyComponent,
} from "./utils"
import * as colorModeUtils from "../src/color-mode.utils"
import { ColorModeProvider } from "../src"

beforeEach(() => {
  jest.resetAllMocks()
  mockIsBrowser(true)
})

describe("<ColorModeProvider /> localStorage browser", () => {
  test("by default, picks from theme.config.initialColorMode", () => {
    render(
      <ColorModeProvider options={defaultThemeOptions}>
        <DummyComponent />
      </ColorModeProvider>,
    )

    expect(getColorModeButton()).toHaveTextContent(
      defaultThemeOptions.initialColorMode,
    )
  })

  test("prefers useSystemColorMode over root property", () => {
    const getColorSchemeSpy = jest
      .spyOn(colorModeUtils, "getColorScheme")
      .mockReturnValueOnce("dark")
    const rootGetSpy = jest.spyOn(colorModeUtils.root, "get")
    const mockLocalStorageManager = createMockStorageManager("localStorage")

    render(
      <ColorModeProvider
        options={{ ...defaultThemeOptions, useSystemColorMode: true }}
        colorModeManager={mockLocalStorageManager}
      >
        <DummyComponent />
      </ColorModeProvider>,
    )

    expect(getColorSchemeSpy).toHaveBeenCalledTimes(1)

    expect(rootGetSpy).not.toHaveBeenCalled()
    expect(mockLocalStorageManager.get).not.toHaveBeenCalled()

    expect(getColorModeButton()).not.toHaveTextContent(
      defaultThemeOptions.initialColorMode,
    )
  })

  test("prefers localStorage over initial color mode and root value", () => {
    const rootGetSpy = jest
      .spyOn(colorModeUtils.root, "get")
      // @ts-expect-error only happens if value doesn't exist, e.g. CSR
      .mockReturnValueOnce("")

    const mockLocalStorageManager = createMockStorageManager(
      "localStorage",
      "dark",
    )

    render(
      <ColorModeProvider
        options={defaultThemeOptions}
        colorModeManager={mockLocalStorageManager}
      >
        <DummyComponent />
      </ColorModeProvider>,
    )

    expect(rootGetSpy).toHaveBeenCalledTimes(1)
    expect(mockLocalStorageManager.get).toHaveBeenCalledTimes(1)

    expect(getColorModeButton()).not.toHaveTextContent(
      defaultThemeOptions.initialColorMode,
    )

    expect(getColorModeButton()).toHaveTextContent("dark")
  })

  test("onChange sets value to all listeners", () => {
    const rootSet = jest.spyOn(colorModeUtils.root, "set")

    const mockLocalStorageManager = createMockStorageManager("localStorage")

    render(
      <ColorModeProvider
        options={defaultThemeOptions}
        colorModeManager={mockLocalStorageManager}
      >
        <DummyComponent />
      </ColorModeProvider>,
    )

    expect(rootSet).toHaveBeenCalledTimes(1)
    expect(mockLocalStorageManager.set).not.toHaveBeenCalled()

    userEvent.click(getColorModeButton())

    expect(rootSet).toHaveBeenCalledTimes(2)
    expect(rootSet).toHaveBeenCalledWith("dark")

    expect(mockLocalStorageManager.set).toHaveBeenCalledTimes(1)
    expect(mockLocalStorageManager.set).toHaveBeenCalledWith("dark")

    expect(getColorModeButton()).toHaveTextContent("dark")
  })
})

describe("<ColorModeProvider /> cookie browser", () => {
  test("by default, picks from cookie", () => {
    const getColorSchemeSpy = jest
      .spyOn(colorModeUtils, "getColorScheme")
      .mockReturnValueOnce("dark")
    const rootGetSpy = jest.spyOn(colorModeUtils.root, "get")

    const mockCookieStorageManager = createMockStorageManager("cookie", "dark")

    render(
      <ColorModeProvider
        options={defaultThemeOptions}
        colorModeManager={mockCookieStorageManager}
      >
        <DummyComponent />
      </ColorModeProvider>,
    )

    expect(getColorModeButton()).toHaveTextContent("dark")

    expect(getColorSchemeSpy).not.toHaveBeenCalled()
    expect(rootGetSpy).not.toHaveBeenCalled()
  })

  test("onChange sets value to all listeners", () => {
    const rootSet = jest.spyOn(colorModeUtils.root, "set")

    const mockCookieStorageManager = createMockStorageManager("cookie")

    render(
      <ColorModeProvider
        options={defaultThemeOptions}
        colorModeManager={mockCookieStorageManager}
      >
        <DummyComponent />
      </ColorModeProvider>,
    )

    expect(rootSet).toHaveBeenCalledTimes(1)
    expect(mockCookieStorageManager.set).not.toHaveBeenCalled()

    userEvent.click(getColorModeButton())

    expect(rootSet).toHaveBeenCalledTimes(2)
    expect(rootSet).toHaveBeenCalledWith("dark")

    expect(mockCookieStorageManager.set).toHaveBeenCalledTimes(1)
    expect(mockCookieStorageManager.set).toHaveBeenCalledWith("dark")

    expect(getColorModeButton()).toHaveTextContent("dark")
  })
})
