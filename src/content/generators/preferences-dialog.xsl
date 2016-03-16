<?xml version="1.0"?>
<!DOCTYPE stylesheet SYSTEM "chrome://guiconfig/locale/gcLocale.dtd">
<xsl:stylesheet version="1.0"
                xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:set="http://exslt.org/sets"
                xmlns:p="http://guiconfig.freedig.org/preferences">

  <xsl:output method="xml"
              indent="no"
              media-type="application/vnd.mozilla.xul+xml" />

  <xsl:template match="p:category">
    <prefpane id="category{position()}" label="{@label}" image="chrome://guiconfig/skin/icons/categories/{@icon}.png" flex="1">
      <preferences>
        <xsl:apply-templates select=".//p:pref[@key and @type]" mode="preferences" />
      </preferences>

      <vbox flex="1" style="overflow-y: auto; overflow-x: hidden">
        <xsl:apply-templates />
      </vbox>
    </prefpane>
  </xsl:template>

  <xsl:template match="p:concern" mode="tabs">
    <tab label="{@label}">
      <xsl:apply-templates select="." mode="filter-attributes" />
    </tab>
  </xsl:template>

  <xsl:template match="p:concern" mode="panes">
    <tabpanel orient="vertical">
      <xsl:apply-templates select="." mode="filter-attributes" />
      <xsl:apply-templates />
    </tabpanel>
  </xsl:template>

  <xsl:template match="p:concerns">
    <tabbox flex="1">
      <xsl:apply-templates select="." mode="filter-attributes" />
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
      <xsl:apply-templates select="." mode="filter-attributes" />
      <caption label="{@label}" />
      <xsl:if test="@description">
        <description><xsl:value-of select="@description" /></description>
      </xsl:if>
      <xsl:choose>
        <xsl:when test="count(p:pref) > 3 and count(p:pref) = count(*) and count(set:distinct(p:pref/@type)) = 1 and p:pref/@type = 'bool' or count(p:checkbox) > 3 and count(p:checkbox) = count(*)">
          <xsl:variable name="half" select="ceiling(count(*) div 2)" />
          <hbox>
            <vbox flex="1">
              <xsl:apply-templates select="*[position() &lt;= $half]" />
            </vbox>
            <vbox flex="1">
              <xsl:apply-templates select="*[position() &gt; $half]" />
            </vbox>
          </hbox>
        </xsl:when>
        <xsl:otherwise>
          <xsl:apply-templates />
        </xsl:otherwise>
      </xsl:choose>
    </groupbox>
  </xsl:template>

  <xsl:template match="p:checkbox">
    <hbox>
      <xsl:apply-templates select="." mode="basic-attributes" />
      <checkbox label="{@label}" value="{@value}" />
    </hbox>
  </xsl:template>

  <xsl:template match="p:pref" mode="preferences">
    <preference id="{@key}" name="{@key}" type="{@type}">
      <xsl:if test="@default">
        <xsl:attribute name="default"><xsl:value-of select="@default"/></xsl:attribute>
      </xsl:if>
      <xsl:if test="@inverted">
        <xsl:attribute name="inverted">true</xsl:attribute>
      </xsl:if>
      <xsl:apply-templates select="." mode="filter-attributes" />
    </preference>
  </xsl:template>

  <xsl:template match="p:pref">
    <box id="{@key}-view" class="gcpreference">
      <xsl:apply-templates select="." mode="basic-attributes" />
      <xsl:apply-templates select="." mode="filter-attributes" />
      <xsl:apply-templates select="." mode="element" />
    </box>
  </xsl:template>

  <xsl:template match="p:pref[@type='bool']" mode="element">
    <checkbox label="{@label}" preference="{@key}" />
  </xsl:template>

  <xsl:template match="p:pref[p:view]" mode="element">
    <vbox flex="1">
      <xsl:apply-templates select="p:view/*" />
    </vbox>
  </xsl:template>

  <xsl:template match="p:pref[@mode='select']" mode="element">
    <label value="{@label}" />
    <menulist preference="{@key}">
      <menupopup>
        <xsl:for-each select="p:option">
          <menuitem label="{@label}" crop="end" value="{text()}" />
        </xsl:for-each>
      </menupopup>
    </menulist>
  </xsl:template>

  <xsl:template match="p:pref[@mode='radio']" mode="element">
    <radiogroup preference="{@key}">
      <xsl:for-each select="p:option">
        <radio label="{@label}" value="{text()}" />
      </xsl:for-each>
    </radiogroup>
  </xsl:template>

  <xsl:template match="p:pref[@mode='color']" mode="element">
    <label value="{@label}" />
    <colorpicker preference="{@key}" type="button" />
  </xsl:template>

  <xsl:template match="p:pref[@mode='file' or p:mode/@name='file']" mode="element">
    <xsl:variable name="filters">
      <xsl:for-each select="p:mode/p:filterType/@value">
        <xsl:value-of select="." />
        <xsl:if test="position() != last()">,</xsl:if>
      </xsl:for-each>
    </xsl:variable>

    <box class="filepicker" label="{@label}" title="&config.choosefile;" filters="{$filters}">
      <textbox flex="1" preference="{@key}" />
    </box>
  </xsl:template>

  <xsl:template match="p:pref" mode="element">
    <label value="{@label}" />
    <xsl:if test="@type = 'int'">
      <spacer flex="1" />
    </xsl:if>
    <textbox preference="{@key}">
      <xsl:choose>
        <xsl:when test="@type = 'int'">
          <xsl:attribute name="type">number</xsl:attribute>
        </xsl:when>
        <xsl:otherwise>
          <xsl:attribute name="flex">1</xsl:attribute>
        </xsl:otherwise>
      </xsl:choose>
      <xsl:if test="@minValue">
        <xsl:attribute name="min"><xsl:value-of select="@minValue" /></xsl:attribute>
      </xsl:if>
      <xsl:if test="@maxValue">
        <xsl:attribute name="max"><xsl:value-of select="@maxValue" /></xsl:attribute>
      </xsl:if>
    </textbox>
  </xsl:template>

  <xsl:template match="p:*" mode="basic-attributes">
    <xsl:variable name="key" select="ancestor-or-self::*[@key and not(starts-with(@key, 'guiconfig.'))][1]/@key" />
    <xsl:if test="$key">
      <xsl:attribute name="data-key"><xsl:value-of select="$key" /></xsl:attribute>
    </xsl:if>
    <xsl:if test="@description">
      <xsl:attribute name="data-description"><xsl:value-of select="@description" /></xsl:attribute>
    </xsl:if>
    <xsl:if test="@indent"><xsl:attribute name="data-indent" /></xsl:if>
  </xsl:template>

  <xsl:template match="p:*" mode="filter-attributes">
    <xsl:if test="@minVersion">
      <xsl:attribute name="data-minVersion"><xsl:value-of select="@minVersion" /></xsl:attribute>
    </xsl:if>
    <xsl:if test="@maxVersion">
      <xsl:attribute name="data-maxVersion"><xsl:value-of select="@maxVersion" /></xsl:attribute>
    </xsl:if>
    <xsl:if test="@platform">
      <xsl:attribute name="data-platform"><xsl:value-of select="@platform" /></xsl:attribute>
    </xsl:if>
  </xsl:template>

  <xsl:template match="*" />

  <xsl:template match="/p:preferences">
    <xsl:apply-templates />
    <prefpane id="guiconfig-search-results" label="&config.searchresults;" image="chrome://guiconfig/skin/icons/categories/search.png" flex="1"></prefpane>
  </xsl:template>

</xsl:stylesheet>
