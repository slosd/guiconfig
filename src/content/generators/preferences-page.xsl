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

  <xsl:import href="chrome://guiconfig/content/generators/preferences-dialog.xsl"/>

  <xsl:output method="xml"
              indent="no"
              media-type="application/vnd.mozilla.xul+xml" />

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
