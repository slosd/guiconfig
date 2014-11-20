<?xml version="1.0"?>
<!DOCTYPE stylesheet SYSTEM "chrome://guiconfig/locale/gcLocale.dtd">
<xsl:stylesheet version="1.0"
                xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:p="http://guiconfig.freedig.org/preferences">

  <xsl:output method="xml"
              indent="no"
              media-type="application/vnd.mozilla.xul+xml" />

  <xsl:template match="p:category">
    <prefpane id="category{position()}" label="{@label}" image="chrome://guiconfig/skin/tango/tab_icons/{@icon}.png" flex="1">
      <preferences>
        <xsl:apply-templates select=".//p:pref[@key and @type]" mode="preferences" />
      </preferences>

      <xsl:apply-templates />
    </prefpane>
  </xsl:template>

  <xsl:template match="p:concern" mode="tabs">
    <tab label="{@label}">
      <xsl:if test="@minVersion"><xsl:attribute name="data-minVersion"><xsl:value-of select="@minVersion" /></xsl:attribute></xsl:if>
      <xsl:if test="@maxVersion"><xsl:attribute name="data-maxVersion"><xsl:value-of select="@maxVersion" /></xsl:attribute></xsl:if>
      <xsl:if test="@platform"><xsl:attribute name="data-platform"><xsl:value-of select="@platform" /></xsl:attribute></xsl:if>
    </tab>
  </xsl:template>

  <xsl:template match="p:concern" mode="panes">
    <tabpanel orient="vertical">
      <xsl:if test="@minVersion"><xsl:attribute name="data-minVersion"><xsl:value-of select="@minVersion" /></xsl:attribute></xsl:if>
      <xsl:if test="@maxVersion"><xsl:attribute name="data-maxVersion"><xsl:value-of select="@maxVersion" /></xsl:attribute></xsl:if>
      <xsl:if test="@platform"><xsl:attribute name="data-platform"><xsl:value-of select="@platform" /></xsl:attribute></xsl:if>

      <xsl:apply-templates />
    </tabpanel>
  </xsl:template>

  <xsl:template match="p:concerns">
    <tabbox flex="1">
      <xsl:if test="@minVersion"><xsl:attribute name="data-minVersion"><xsl:value-of select="@minVersion" /></xsl:attribute></xsl:if>
      <xsl:if test="@maxVersion"><xsl:attribute name="data-maxVersion"><xsl:value-of select="@maxVersion" /></xsl:attribute></xsl:if>
      <xsl:if test="@platform"><xsl:attribute name="data-platform"><xsl:value-of select="@platform" /></xsl:attribute></xsl:if>

      <tabs orient="horizontal">
        <xsl:apply-templates mode="tabs" />
      </tabs>
      <tabpanels flex="1">
        <xsl:apply-templates mode="panes" />
      </tabpanels>
    </tabbox>
  </xsl:template>

  <xsl:template match="p:group">
    <groupbox>
      <xsl:if test="@minVersion"><xsl:attribute name="data-minVersion"><xsl:value-of select="@minVersion" /></xsl:attribute></xsl:if>
      <xsl:if test="@maxVersion"><xsl:attribute name="data-maxVersion"><xsl:value-of select="@maxVersion" /></xsl:attribute></xsl:if>
      <xsl:if test="@platform"><xsl:attribute name="data-platform"><xsl:value-of select="@platform" /></xsl:attribute></xsl:if>

      <caption label="{@label}" />
      <xsl:apply-templates />
    </groupbox>
  </xsl:template>

  <xsl:template match="p:checkbox">
    <hbox>
      <xsl:if test="@description">
        <xsl:attribute name="data-description"><xsl:value-of select="@description" /></xsl:attribute>
        <xsl:attribute name="onmouseover">guiconfig.preferences.setDescription(this.getAttribute('data-description'))</xsl:attribute>
        <xsl:attribute name="onmouseout">guiconfig.preferences.setDescription('')</xsl:attribute>
      </xsl:if>
      <xsl:if test="@minVersion"><xsl:attribute name="data-minVersion"><xsl:value-of select="@minVersion" /></xsl:attribute></xsl:if>
      <xsl:if test="@maxVersion"><xsl:attribute name="data-maxVersion"><xsl:value-of select="@maxVersion" /></xsl:attribute></xsl:if>
      <xsl:if test="@platform"><xsl:attribute name="data-platform"><xsl:value-of select="@platform" /></xsl:attribute></xsl:if>

      <checkbox label="{@label}" value="{@value}" />
    </hbox>
  </xsl:template>

  <xsl:template match="p:pref" mode="preferences">
    <preference id="{@key}" name="{@key}" type="{@type}">
      <xsl:if test="@default">
        <xsl:attribute name="default"><xsl:value-of select="@default"/></xsl:attribute>
      </xsl:if>
      <xsl:if test="@minVersion"><xsl:attribute name="data-minVersion"><xsl:value-of select="@minVersion" /></xsl:attribute></xsl:if>
      <xsl:if test="@maxVersion"><xsl:attribute name="data-maxVersion"><xsl:value-of select="@maxVersion" /></xsl:attribute></xsl:if>
      <xsl:if test="@platform"><xsl:attribute name="data-platform"><xsl:value-of select="@platform" /></xsl:attribute></xsl:if>
    </preference>
  </xsl:template>

  <xsl:template match="p:pref">
    <hbox class="prefrow" align="center" context="_child">
      <xsl:attribute name="id"><xsl:value-of select="@key" />-view</xsl:attribute>
      <xsl:if test="@description">
        <xsl:attribute name="data-description"><xsl:value-of select="@description" /></xsl:attribute>
        <xsl:attribute name="onmouseover">guiconfig.preferences.setDescription(this.getAttribute('data-description'))</xsl:attribute>
        <xsl:attribute name="onmouseout">guiconfig.preferences.setDescription('')</xsl:attribute>
      </xsl:if>
      <xsl:if test="@minVersion"><xsl:attribute name="data-minVersion"><xsl:value-of select="@minVersion" /></xsl:attribute></xsl:if>
      <xsl:if test="@maxVersion"><xsl:attribute name="data-maxVersion"><xsl:value-of select="@maxVersion" /></xsl:attribute></xsl:if>
      <xsl:if test="@platform"><xsl:attribute name="data-platform"><xsl:value-of select="@platform" /></xsl:attribute></xsl:if>
      <xsl:if test="@indent">
        <xsl:attribute name="class">prefrow indent</xsl:attribute>
      </xsl:if>
      <xsl:apply-templates select="." mode="element" />
      <menupopup>
        <menuitem label="&config.todefault;" class="menuitem-iconic" image="/skin/tango/actions/reset.png" oncommand="guiconfig.preferences.resetPreference('{@key}')" />
      </menupopup>
    </hbox>
  </xsl:template>

  <xsl:template match="p:pref[@type='bool']" mode="element">
    <checkbox label="{@label}" preference="{@key}" />
  </xsl:template>

  <xsl:template match="p:pref" mode="element">
    <!-- find mode in which to display the preference -->
    <xsl:variable name="mode">
      <xsl:choose>
        <xsl:when test="p:mode/@name">
          <xsl:value-of select="p:mode/@name" />
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="@mode" />
        </xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <xsl:choose>
      <xsl:when test="$mode = 'select'">
        <label value="{@label}" />
        <menulist preference="{@key}" flex="1">
          <menupopup>
            <xsl:for-each select="p:option">
              <menuitem label="{@label}" crop="end" value="{text()}" />
            </xsl:for-each>
          </menupopup>
        </menulist>
      </xsl:when>
      <xsl:when test="$mode = 'radio'">
        <radiogroup preference="{@key}">
          <xsl:for-each select="p:option">
            <radio label="{@label}" value="{text()}" />
          </xsl:for-each>
        </radiogroup>
      </xsl:when>
      <xsl:when test="$mode = 'color'">
        <label value="{@label}" />
        <colorpicker preference="{@key}" type="button" />
      </xsl:when>
      <xsl:when test="$mode = 'file'">
        <label value="{@label}" />
        <textbox preference="{@key}" flex="1" />
        <button class="select-file" label="&config.browse;" title="&config.choosefile;" icon="open" />
      </xsl:when>
      <xsl:when test="p:view">
        <vbox flex="1">
          <xsl:apply-templates select="p:view/*" />
        </vbox>
      </xsl:when>
      <xsl:otherwise>
        <label value="{@label}" />
        <textbox preference="{@key}" flex="1">
          <xsl:if test="@type = 'int'">
            <xsl:attribute name="type">number</xsl:attribute>
          </xsl:if>
          <xsl:if test="@minValue">
            <xsl:attribute name="min"><xsl:value-of select="@minValue" /></xsl:attribute>
          </xsl:if>
          <xsl:if test="@maxValue">
            <xsl:attribute name="max"><xsl:value-of select="@maxValue" /></xsl:attribute>
          </xsl:if>
        </textbox>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template match="*" />

  <xsl:template match="/p:preferences">
    <xsl:apply-templates />
  </xsl:template>

</xsl:stylesheet>
