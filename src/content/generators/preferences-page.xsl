<?xml version="1.0"?>
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
    <richlistitem class="category" value="category{position()}" align="center">
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
      <richlistitem class="category" value="categorySearch" align="center">
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
