<?xml version="1.0"?>
<!--
    Copyright (C) 2014, 2015 Thomas Leberbauer

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
-->

<!DOCTYPE stylesheet SYSTEM "chrome://guiconfig/locale/gcLocale.dtd">
<xsl:stylesheet version="1.0"
                xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:set="http://exslt.org/sets"
                xmlns:p="http://guiconfig.freedig.org/preferences">


  <xsl:output method="xml"
              indent="no"
              media-type="application/vnd.mozilla.xul+xml" />

  <!-- <xsl:import href="chrome://guiconfig/content/generators/preferences-dialog.xsl"/> -->
  <!-- Workaround for https://bugzilla.mozilla.org/show_bug.cgi?id=1249572 -->
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
  <!-- WORKAROUND END -->

  <xsl:template match="p:category" mode="category-selection">
    <richlistitem class="category category-{@icon}" value="category{position()}" align="center">
      <image class="category-icon" />
      <label class="category-name" flex="1" value="{@label}" />
    </richlistitem>
  </xsl:template>

  <xsl:template match="p:category">
    <preferences>
      <xsl:apply-templates select=".//p:pref[@key and @type]" mode="preferences" />
    </preferences>

    <hbox class="header" data-category="category{position()}">
      <xsl:if test="local-name(*[1]) = 'concerns'">
        <xsl:attribute name="class">header merged</xsl:attribute>
      </xsl:if>
      <label class="header-name" value="{@label}" />
    </hbox>

    <vbox data-category="category{position()}">
      <xsl:apply-templates />
    </vbox>
  </xsl:template>

  <xsl:template match="/p:preferences">
    <richlistbox id="categories" flex="1">
      <xsl:apply-templates mode="category-selection" />
      <richlistitem class="category category-search" value="categorySearch" align="center">
        <image class="category-icon" />
        <label class="category-name" flex="1" value="&config.searchresults;" />
      </richlistitem>
    </richlistbox>

    <vbox class="main-content" flex="1">
      <prefpane id="mainPrefPane">
        <xsl:apply-templates />
        <hbox class="header" data-category="categorySearch">
          <label class="header-name" value="&config.searchresults;" />
        </hbox>
        <vbox id="guiconfig-search-results" data-category="categorySearch"></vbox>
      </prefpane>
    </vbox>
  </xsl:template>

</xsl:stylesheet>
